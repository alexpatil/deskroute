// features/organization/organization.types.ts
export interface CreateOrganizationRequest {
  name: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  isActive?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  ownerUserId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OrganizationWithOwner extends Organization {
  owner: {
    id: string;
    email: string;
  };
}