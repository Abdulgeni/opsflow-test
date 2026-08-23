import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { status?: string; type?: string; search?: string }) {
    const { status, type, search } = params;
    return this.prisma.client.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contactLogs: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true } } },
        },
      },
    });
    if (!client) throw new NotFoundException("Client not found");
    return client;
  }

  async create(data: { name: string; type: "INDIVIDUAL" | "ORGANIZATION"; email: string; phone?: string }) {
    return this.prisma.client.create({
      data: { ...data, status: "LEAD" },
    });
  }

  async update(id: string, data: Partial<{ name: string; email: string; phone: string; status: string }>) {
    return this.prisma.client.update({ where: { id }, data: data as any });
  }

  async addContactLog(clientId: string, createdById: string, notes: string, type: "CALL" | "MEETING" | "EMAIL" = "CALL") {
    return this.prisma.contactLog.create({
      data: { clientId, createdById, notes, type },
    });
  }
}