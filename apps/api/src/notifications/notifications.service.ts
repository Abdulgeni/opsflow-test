import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "./notifications.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway
  ) {}

  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async create(userId: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, message },
    });
    this.gateway.broadcastNewNotification(userId, notification);
    return notification;
  }
}