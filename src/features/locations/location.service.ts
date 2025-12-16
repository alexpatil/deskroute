import prisma from "@/lib/prisma";
import type { CreateLocationRequest, OfficeLocation } from "./location.types";

export const locationService = {
  async create(data: CreateLocationRequest): Promise<OfficeLocation> {
    const location = await prisma.location.create({
      data: {
        name: data.name,
        type: data.type,
        organizationId: data.organizationId,
      },
    });

    return location;
  },

  async listByOrganization(organizationId: string, type?: "OFFICE" | "RTO"): Promise<OfficeLocation[]> {
    const where: any = { organizationId };
    if (type) where.type = type;

    const locations = await prisma.location.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return locations;
  },

  async getById(locationId: string): Promise<OfficeLocation | null> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    return location;
  },

  async delete(locationId: string): Promise<void> {
    await prisma.location.delete({
      where: { id: locationId },
    });
  },
};
