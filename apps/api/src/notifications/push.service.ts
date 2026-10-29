import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_BATCH = 100;

interface ExpoMessage {
  to: string; title: string; body: string; data?: Record<string, unknown>;
  sound: "default"; channelId: string; priority: "high";
}

type ExpoTicket = { status: "ok"; id: string } | { status: "error"; message?: string; details?: { error?: string } };

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  constructor(private prisma: PrismaService) {}

  isExpoToken(token: unknown): token is string {
    return typeof token === "string" && /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
  }

  async register(userId: string, token: unknown, platform?: string) {
    if (!this.isExpoToken(token)) throw new BadRequestException("Invalid Expo push token");
    await this.prisma.pushToken.upsert({
      where: { token },
      create: { token, userId, platform: platform?.slice(0, 20) },
      update: { userId, platform: platform?.slice(0, 20) },
    });
    return { success: true };
  }

  async unregister(userId: string, token: unknown) {
    if (!this.isExpoToken(token)) return { success: true };
    await this.prisma.pushToken.deleteMany({ where: { token, userId } });
    return { success: true };
  }

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const rows = await this.prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
    if (rows.length === 0) return;

    const messages: ExpoMessage[] = rows.map((r) => ({
      to: r.token, title, body, data, sound: "default", channelId: "default", priority: "high",
    }));

    for (let i = 0; i < messages.length; i += MAX_BATCH) {
      await this.sendBatch(messages.slice(i, i + MAX_BATCH));
    }
  }

  private async sendBatch(messages: ExpoMessage[]) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    if (!res.ok) { this.logger.warn(`Expo push failed: ${res.status}`); return; }
    const json = (await res.json()) as { data?: ExpoTicket[] };
    const dead: string[] = [];
    (json.data ?? []).forEach((ticket, i) => {
      if (ticket.status !== "error") return;
      if (ticket.details?.error === "DeviceNotRegistered") dead.push(messages[i].to);
    });
    if (dead.length > 0) await this.prisma.pushToken.deleteMany({ where: { token: { in: dead } } });
  }
}
