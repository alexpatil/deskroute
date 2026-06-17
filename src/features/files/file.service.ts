import prisma from "@/lib/prisma";
import type { CreateFileRequest, File, FileWithHistory, UpdateFileRequest } from "./file.types";

export const fileService = {
  async create(data: CreateFileRequest): Promise<File> {
    // Assign a human-friendly, per-organization sequential file number.
    // Atomically incrementing the organization counter (an UPDATE that locks
    // the row) guarantees no two concurrent creates get the same number, so
    // numbers are never duplicated within an organization.
    const file = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id: data.organizationId },
        data: { fileSeq: { increment: 1 } },
        select: { fileSeq: true },
      });

      return tx.file.create({
        data: {
          fileNumber: org.fileSeq,
          subjectName: data.subjectName,
          category: data.category,
          referenceId: data.referenceId,
          priority: data.priority ?? "NORMAL",
          dueDate: data.dueDate,
          description: data.description,
          currentLocationId: data.currentLocationId,
          currentStatusId: data.currentStatusId,
          organizationId: data.organizationId,
          history: {
            create: {
              toLocationId: data.currentLocationId,
              statusId: data.currentStatusId,
              locationChanged: false,
              statusChanged: false,
              oldStatusName: null,
              newStatusName: null,
            },
          },
        },
        include: {
          currentLocation: true,
          currentStatus: true,
        },
      });
    });

    return file as unknown as File;
  },

  async update(fileId: string, data: UpdateFileRequest): Promise<File> {
    const currentFile = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        currentStatus: true,
      },
    });

    if (!currentFile) {
      throw new Error("File not found");
    }

    const locationChanged =
      data.currentLocationId !== undefined && data.currentLocationId !== currentFile.currentLocationId;
    const statusChanged =
      data.currentStatusId !== undefined && data.currentStatusId !== currentFile.currentStatusId;

    if (!locationChanged && !statusChanged) {
      return prisma.file.findUnique({
        where: { id: fileId },
        include: {
          currentLocation: true,
          currentStatus: true,
        },
      }) as Promise<File>;
    }

    let newStatus = currentFile.currentStatus;
    if (statusChanged && data.currentStatusId) {
      const status = await prisma.fileStatus.findUnique({
        where: { id: data.currentStatusId },
      });
      if (status) {
        newStatus = status;
      }
    }

    const file = await prisma.file.update({
      where: { id: fileId },
      data: {
        ...(locationChanged && { currentLocationId: data.currentLocationId }),
        ...(statusChanged && { currentStatusId: data.currentStatusId }),
        ...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
        history: {
          create: {
            fromLocationId: locationChanged ? currentFile.currentLocationId : null,
            toLocationId: data.currentLocationId ?? currentFile.currentLocationId,
            statusId: data.currentStatusId ?? currentFile.currentStatusId,
            locationChanged,
            statusChanged,
            oldStatusName: statusChanged ? currentFile.currentStatus.name : null,
            newStatusName: statusChanged ? newStatus.name : null,
          },
        },
      },
      include: {
        currentLocation: true,
        currentStatus: true,
      },
    });

    return file as unknown as File;
  },

  async listByOrganization(
    organizationId: string,
    filter?: "active" | "completed",
    locationId?: string,
  ): Promise<File[]> {
    const where: any = { organizationId };

    if (filter === "active") where.isCompleted = false;
    if (filter === "completed") where.isCompleted = true;
    if (locationId) where.currentLocationId = locationId;

    return prisma.file.findMany({
      where,
      include: {
        currentLocation: true,
        currentStatus: true,
      },
      orderBy: { updatedAt: "desc" },
    }) as unknown as Promise<File[]>;
  },

  async getById(fileId: string): Promise<FileWithHistory | null> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        currentLocation: true,
        currentStatus: true,
        history: {
          include: {
            fromLocation: true,
            toLocation: true,
            status: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return file as unknown as FileWithHistory | null;
  },

  async markCompleted(fileId: string): Promise<File> {
    const file = await prisma.file.update({
      where: { id: fileId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        currentLocation: true,
        currentStatus: true,
      },
    });

    return file as unknown as File;
  },
};
