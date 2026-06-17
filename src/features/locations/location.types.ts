export interface CreateLocationRequest {
  name: string;
  type: string;
  organizationId: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  type: string;
  organizationId: string;
  createdAt: Date;
}
