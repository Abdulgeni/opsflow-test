import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { category?: string; linkedTo?: string; search?: string }) {
    const { category, linkedTo, search } = params;
    return this.prisma.document.findMany({
      where: {
        ...(category && { category }),
        ...(linkedTo && { linkedTo }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { name: true } },
        versions: { orderBy: { versionNumber: "desc" } },
      },
    });
    if (!document) throw new NotFoundException("Document not found");
    return document;
  }

  async create(data: { title: string; category: string; linkedTo: string; uploadedById: string }) {
    const document = await this.prisma.document.create({
      data: { ...data, version: 1 },
    });
    await this.prisma.documentVersion.create({
      data: { documentId: document.id, versionNumber: 1, note: "Initial upload" },
    });
    return document;
  }
}