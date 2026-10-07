import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // ─── Internal (staff) methods ──────────────────────────────────

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

  // ─── Portal (CLIENT) methods ───────────────────────────────────

  // Returns only documents this client is allowed to see:
  //  - documents linked directly to their own Client record
  //  - documents linked to any Property they hold a Lease on
  async findForPortalUser(clientId: string) {
    const leases = await this.prisma.lease.findMany({
      where: { clientId },
      select: { propertyId: true },
    });
    const propertyIds = leases.map((l) => l.propertyId);

    const documents = await this.prisma.document.findMany({
      where: {
        OR: [
          { linkedEntityType: "Client", linkedEntityId: clientId },
          { linkedEntityType: "Property", linkedEntityId: { in: propertyIds } },
        ],
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

  // Throws if the client is not allowed to access the given document.
  // Used by the /documents/mine/:id/download-url route before issuing a signed URL.
  async assertPortalAccess(documentId: string, clientId: string): Promise<void> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException("Document not found");

    const hasAccess = await this.clientHasAccessToLinkedEntity(
      clientId,
      doc.linkedEntityType,
      doc.linkedEntityId
    );

    if (!hasAccess) {
      throw new ForbiddenException({
        statusCode: 403,
        code: "FORBIDDEN_NOT_LINKED",
        message: "You can only access your own documents",
      });
    }
  }

  // ─── Shared helpers ────────────────────────────────────────────

  private async clientHasAccessToLinkedEntity(
    clientId: string,
    linkedEntityType: string,
    linkedEntityId: string
  ): Promise<boolean> {
    if (linkedEntityType === "Client") {
      return linkedEntityId === clientId;
    }
    if (linkedEntityType === "Property") {
      const lease = await this.prisma.lease.findFirst({
        where: { clientId, propertyId: linkedEntityId },
      });
      return lease !== null;
    }
    return false;
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

  async update(id: string, data: { title?: string; category?: string }) {
    const existing = await this.prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Document not found");
    return this.prisma.document.update({ where: { id }, data });
  }
}