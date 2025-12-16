export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: string;
  hasOrganization: boolean;
  isOwner: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string | null;
  assignedLocationId: string | null;
  canViewAllFiles: boolean;
  canManageOffices: boolean;
  canManageStaff: boolean;
  canConfigureStatuses: boolean;
  canManageLocations: boolean;
  isOwner: boolean;
}