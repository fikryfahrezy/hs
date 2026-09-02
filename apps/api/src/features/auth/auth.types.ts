export type AuthUser = {
  id: string;
  email: string;
  timezone: string;
  created_at: Date;
};

export type StoredAuthUser = AuthUser & {
  password_hash: string;
};
