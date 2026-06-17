export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface CreateFileRequest {
  subjectName: string;
  category: string;
  currentLocationId: string;
  currentStatusId: string;
  organizationId: string;
  referenceId?: string;
  priority?: Priority;
  dueDate?: Date | null;
  description?: string;
}

export interface UpdateFileRequest {
  currentLocationId?: string;
  currentStatusId?: string;
  isCompleted?: boolean;
}

export interface File {
  id: string;
  trackingNumber: string;
  fileNumber: number | null;
  referenceId: string | null;
  subjectName: string;
  category: string;
  priority: Priority;
  dueDate: Date | null;
  description: string | null;
  currentLocationId: string;
  currentStatusId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  currentLocation: {
    id: string;
    name: string;
    type: string;
  };
  currentStatus: {
    id: string;
    name: string;
  };
}

export interface FileHistory {
  id: string;
  fileId: string;
  fromLocationId: string | null;
  toLocationId: string;
  statusId: string;
  locationChanged: boolean;
  statusChanged: boolean;
  oldStatusName: string | null;
  newStatusName: string | null;
  createdAt: Date;
  fromLocation: {
    id: string;
    name: string;
    type: string;
  } | null;
  toLocation: {
    id: string;
    name: string;
    type: string;
  };
  status: {
    id: string;
    name: string;
  };
}

export interface FileWithHistory extends File {
  history: FileHistory[];
}

export interface FileHistoryEntry {
  id: string;
  fromLocationId: string | null;
  fromLocation?: {
    id: string;
    name: string;
    type: string;
  } | null;
  toLocationId: string;
  toLocation: {
    id: string;
    name: string;
    type: string;
  };
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  createdAt: Date;
}
