
// features/locations/location.types.ts
export interface CreateLocationRequest {
  name: string;
  type: 'OFFICE' | 'RTO';
  organizationId: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  type: 'OFFICE' | 'RTO';
  organizationId: string;
  createdAt: Date;
}