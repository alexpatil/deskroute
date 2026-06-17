export interface CreateOrganizationRequest {
  name: string;
  ownerEmail: string;
  ownerPassword: string;
  industry?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  isActive?: boolean;
  industry?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  industry: string | null;
  plan: string;
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
