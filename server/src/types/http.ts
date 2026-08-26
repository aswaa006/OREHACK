export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data?: T;
};

export type ApiFailure = {
  success: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type UserRole = "developer_admin" | "hackathon_admin" | "jury" | "team" | "SUPER_ADMIN" | "EVENT_ADMIN" | "PARTICIPANT";

export type JwtClaims = {
  sub: string;
  role: UserRole;
  hackathonSlug?: string;
  teamId?: string;
  email?: string;
};
