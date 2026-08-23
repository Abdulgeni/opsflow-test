import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { status?: string; type?: string; search?: string }) {
    const { status, type, search } = params;
    return this.prisma.property.findMany({
      where: {
        archivedAt: null,
        ...(status && { status: status as any }),
        ...(type && { type }),
        ...(search && { name: { contains: search, mode: "insensitive" } }),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        maintenanceRequests: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!property) throw new NotFoundException("Property not found");
    return property;
  }

  async create(data: { name: string; address: string; type: string; size?: number }) {
    return this.prisma.property.create({
      data: { ...data, status: "AVAILABLE" },
    });
  }

  async update(id: string, data: Partial<{ name: string; address: string; type: string; size: number }>) {
    return this.prisma.property.update({ where: { id }, data });
  }

  async archive(id: string) {
    return this.prisma.property.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  async createMaintenanceRequest(propertyId: string, description: string) {
    const request = await this.prisma.maintenanceRequest.create({
      data: { propertyId, description, status: "OPEN" },
    });

    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (property && property.status !== "UNDER_MAINTENANCE") {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { statusBeforeMaintenance: property.status, status: "UNDER_MAINTENANCE" },
      });
    }

    return request;
  }

  async resolveMaintenanceRequest(id: string) {
    const existing = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Maintenance request not found");

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });

    const stillOpen = await this.prisma.maintenanceRequest.count({
      where: { propertyId: existing.propertyId, status: { not: "RESOLVED" } },
    });

    if (stillOpen === 0) {
      const property = await this.prisma.property.findUnique({ where: { id: existing.propertyId } });
      if (property?.statusBeforeMaintenance) {
        await this.prisma.property.update({
          where: { id: existing.propertyId },
          data: { status: property.statusBeforeMaintenance, statusBeforeMaintenance: null },
        });
      }
    }

    return updated;
  }
}