export interface CreateFileRequest {
  clientName: string;
  serviceType: string;
  currentLocationId: string;
  currentStatusId: string;
  organizationId: string;
}

export interface UpdateFileRequest {
  currentLocationId?: string;
  currentStatusId?: string;
  isCompleted?: boolean;
}

export interface File {
  id: string;
  clientName: string;
  serviceType: string;
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
