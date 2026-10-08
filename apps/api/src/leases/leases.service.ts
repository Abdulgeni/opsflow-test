import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeasesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { propertyId?: string; clientId?: string; status?: string }) {
    return this.prisma.lease.findMany({
      where: {
        ...(params.propertyId && { propertyId: params.propertyId }),
        ...(params.clientId && { clientId: params.clientId }),
        ...(params.status && { status: params.status as any }),
      },
      include: { property: true, client: true },
      orderBy: { startDate: "desc" },
    });
  }

  // Scoped: a CLIENT-role user only ever sees leases belonging to their own linked Client record.
  async findForPortalUser(userClientId: string) {
    return this.prisma.lease.findMany({
      where: { clientId: userClientId },
      include: { property: true },
      orderBy: { startDate: "desc" },
    });
  }

  async findOne(id: string, requestingUser: { role: string; clientId?: string }) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { property: true, client: true },
    });
    if (!lease) throw new NotFoundException("Lease not found");

    // Row-level check: a Client-role user may only open their own lease.
    if (requestingUser.role === "CLIENT" && lease.clientId !== requestingUser.clientId) {
      throw new ForbiddenException({
        statusCode: 403,
        code: "FORBIDDEN_NOT_OWNER",
        message: "You can only view your own leases",
      });
    }
    return lease;
  }

  // Documents linked to the property this lease is on.
  // Caller is responsible for checking the user is allowed to see this lease first.
  async findLinkedDocuments(propertyId: string) {
    return this.prisma.document.findMany({
      where: { linkedEntityType: "Property", linkedEntityId: propertyId },
      select: {
        id: true,
        title: true,
        category: true,
        version: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    propertyId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
  }) {
    return this.prisma.lease.create({
      data: {
        propertyId: data.propertyId,
        clientId: data.clientId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        rentAmount: data.rentAmount,
        status: "PENDING",
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      startDate: string;
      endDate: string;
      rentAmount: number;
      status: string;
      renewalNotes: string;
    }>
  ) {
    return this.prisma.lease.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.rentAmount !== undefined && { rentAmount: data.rentAmount }),
        ...(data.status && { status: data.status as any }),
        ...(data.renewalNotes !== undefined && { renewalNotes: data.renewalNotes }),
      },
    });
  }
}