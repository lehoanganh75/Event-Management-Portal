export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  majorName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "GUEST" | "USER" | "ADMIN" | "ORGANIZER";
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}