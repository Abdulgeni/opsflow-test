import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // Admin creates a user — cannot access any module until activated (SRS 4.8.5)
  async create(dto: {
    name: string;
    email: string;
    phone?: string;
    department?: string;
    role: "ADMIN" | "MANAGER" | "STAFF" | "EXECUTIVE";
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException("A user with this email already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        department: dto.department,
        role: dto.role,
        status: "PENDING",
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48h

    await this.prisma.activationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    return { user, activationToken: token };
  }

  async updateRole(id: string, role: "ADMIN" | "MANAGER" | "STAFF" | "EXECUTIVE") {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async updateStatus(id: string, status: "ACTIVE" | "PENDING" | "DEACTIVATED") {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  // Self-service — role is deliberately excluded (SRS 4.8.1)
  async updateOwnProfile(
    userId: string,
    data: { name?: string; phone?: string; department?: string }
  ) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async activateAccount(token: string, password: string) {
    const tokenRecord = await this.prisma.activationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt) {
      throw new BadRequestException("Invalid or already-used activation link");
    }
    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException("This activation link has expired");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash, status: "ACTIVE" },
      }),
      this.prisma.activationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  async getLoginActivity(userId: string) {
    return this.prisma.loginActivity.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 50,
    });
  }
}