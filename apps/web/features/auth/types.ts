export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};
