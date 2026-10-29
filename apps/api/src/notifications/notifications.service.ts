import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "./notifications.gateway";
import { PushService } from "./push.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService, private gateway: NotificationsGateway, private push: PushService) {}

  async findForUser(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
    return { success: true };
  }

  async create(userId: string, message: string, data?: Record<string, unknown>) {
    const notification = await this.prisma.notification.create({ data: { userId, message } });
    this.gateway.broadcastNewNotification(userId, notification);
    void this.push.sendToUser(userId, "OpsFlow", message, data).catch((err) => this.logger.warn(`Push failed: ${err}`));
    return notification;
  }
}
