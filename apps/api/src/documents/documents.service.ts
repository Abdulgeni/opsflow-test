import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { category?: string; linkedEntityId?: string; search?: string }) {
    const { category, linkedEntityId, search } = params;
    const documents = await this.prisma.document.findMany({
      where: {
        ...(category && { category }),
        ...(linkedEntityId && { linkedEntityId }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        linkedEntityName: await this.resolveEntityName(doc.linkedEntityType, doc.linkedEntityId),
      }))
    );
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

    const linkedEntityName = await this.resolveEntityName(document.linkedEntityType, document.linkedEntityId);

    return { ...document, linkedEntityName };
  }

  private async resolveEntityName(type: string, id: string): Promise<string | null> {
    if (type === "Property") {
      const property = await this.prisma.property.findUnique({ where: { id }, select: { name: true } });
      return property?.name ?? null;
    }
    if (type === "Client") {
      const client = await this.prisma.client.findUnique({ where: { id }, select: { name: true } });
      return client?.name ?? null;
    }
    return null;
  }

  async create(data: { title: string; category: string; linkedEntityType: string; linkedEntityId: string; uploadedById: string }) {
    const document = await this.prisma.document.create({
      data: { ...data, version: 1 },
    });
    await this.prisma.documentVersion.create({
      data: { documentId: document.id, versionNumber: 1, note: "Initial upload" },
    });
    return document;
  }
}