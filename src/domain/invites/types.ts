export type InviteItem = {
  id: number;
  uuid: string;
  token: string;
  email: string;
  status: string;
  orgName: string;
  invitedByName: string;
  created_at: Date;
  expires_at: Date;
  accepted_at: Date | null;
};
