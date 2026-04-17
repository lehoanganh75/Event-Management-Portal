// types/event.ts

export interface Registration {
  id: string;
  participantAccountId: string;
  status: "ATTENDED" | "REGISTERED" | "CANCELLED";
  answersJson: Record<string, any>;
  ticketCode: string;
  qrToken: string;
  qrTokenExpiry: string;
  checkedIn: boolean;
  checkInTime: string | null;
  checkedInByAccountId: string | null;
  registeredAt: string;
  updatedAt: string | null;
  deleted: boolean;
}

export interface Presenter {
  id: string;
  presenterAccountId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  position: string;
  department: string;
  bio: string;
  linkedInUrl: string | null;
  session: string;
  assignedAt: string;
  deleted: boolean;
}

export interface UserSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  email: string;
}

export interface Recipient {
  type: string;
  faculty: string;
}

export interface CurrentUserRole {
  registration: Registration | null;
  presenter: Presenter | null;
  canEditEvent: boolean;
  canManageRegistrations: boolean;
  canViewTicket: boolean;
  registered: boolean;
  creator: boolean;
  approver: boolean;
  presented: boolean;
  organizer: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventTopic: string;
  coverImage: string;
  location: string;
  eventMode: "ONLINE" | "OFFLINE" | "HYBRID";
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  createdByAccountId: string;
  approvedByAccountId: string;
  maxParticipants: number;
  type: string;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  finalized: boolean;
  archived: boolean;
  hasLuckyDraw: boolean;
  notes: string | null;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt: string | null;
  customFieldsJson: any | null;
  targetObjects: any | null;
  recipients: Recipient[];
  registeredCount: number;
  registrations: Registration[];
  organizers: any[];
  presenters: Presenter[];
  creator: UserSummary;
  approver: UserSummary;
  currentUserRole: CurrentUserRole; // Đây là phần logic bạn vừa thêm
  deleted: boolean;
}

export enum DrawStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

export interface Prize {
  id?: string;
  name: string;
  quantity: number;
  description?: string;
  winProbabilityPercent: number;
  remainingQuantity?: number;
}

export interface LuckyDraw {
  id: string;
  eventId: string;
  title: string;
  description: string;
  status: DrawStatus;
  startTime: string;
  endTime: string;
  allowMultipleWins: boolean;
  prizes: Prize[];
}

export interface DrawResultResponse {
  message: string;
  prize?: Prize;
}
