export interface CreateFileStatusRequest {
  name: string;
  organizationId: string;
}

export interface UpdateFileStatusRequest {
  name?: string;
  isEnabled?: boolean;
}

export interface FileStatus {
  id: string;
  name: string;
  isEnabled: boolean;
  organizationId: string;
  createdAt: Date;
}
