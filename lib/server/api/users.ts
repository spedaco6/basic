import { HTTPError } from "../errors";
import { User } from "../models/User";
import { verifyAccessToken } from "../tokens";
import { ProfileData } from "./profile";

export const getUsers = async (accessToken: string): Promise<Partial<ProfileData>[]> => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);

  const userRole = verified.userId;
  if (userRole >= 40) throw new HTTPError("Unauthorized user", 401);

  const permissions = [10, 20, 30, 40];
  const accessible = permissions.filter(p => p >= userRole);

  // Find user
  const users = await User.find({ role: accessible });
  const desensitized = users?.map(user => ({
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  }));
  return desensitized ?? [];
}