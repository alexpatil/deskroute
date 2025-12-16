export interface CreateStaffRequest {
  email: string;
  password: string;
  role: "STAFF" | "ADMIN";
  organizationId: string;
  assignedLocationId?: string;
  canViewAllFiles?: boolean;
  canManageOffices?: boolean;
  canManageStaff?: boolean;
  canConfigureStatuses?: boolean;
  canManageLocations?: boolean;
}

export interface UpdateStaffRequest {
  assignedLocationId?: string;
  canViewAllFiles?: boolean;
  canManageOffices?: boolean;
  canManageStaff?: boolean;
  canConfigureStatuses?: boolean;
  canManageLocations?: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  role: string;
  assignedLocationId: string | null;
  assignedLocation?: {
    id: string;
    name: string;
    type: string;
  } | null;
  canViewAllFiles: boolean;
  canManageOffices: boolean;
  canManageStaff: boolean;
  canConfigureStatuses: boolean;
  canManageLocations: boolean;
  createdAt: Date;
}
