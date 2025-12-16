import prisma from "@/lib/prisma";
import type { CreateFileStatusRequest, FileStatus, UpdateFileStatusRequest } from "./fileStatus.types";

export const fileStatusService = {
  async create(data: CreateFileStatusRequest): Promise<FileStatus> {
    const status = await prisma.fileStatus.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        isEnabled: true,
      },
    });

    return status;
  },

  async update(statusId: string, data: UpdateFileStatusRequest): Promise<FileStatus> {
    const status = await prisma.fileStatus.update({
      where: { id: statusId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
      },
    });

    return status;
  },

  async listByOrganization(organizationId: string, enabledOnly?: boolean): Promise<FileStatus[]> {
    const where: any = { organizationId };
    if (enabledOnly) where.isEnabled = true;

    const statuses = await prisma.fileStatus.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return statuses;
  },

  async getById(statusId: string): Promise<FileStatus | null> {
    const status = await prisma.fileStatus.findUnique({
      where: { id: statusId },
    });

    return status;
  },

  async delete(statusId: string): Promise<void> {
    await prisma.fileStatus.delete({
      where: { id: statusId },
    });
  },
};
