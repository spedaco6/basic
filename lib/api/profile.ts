import { HTTPError } from "../server/errors";
import { User } from "../server/models/User";
import { verifyAccessToken } from "../server/tokens";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

interface ProfileData {
  userId: number,
  userRole: number,
  email: string,
  firstName?: string,
  lastName?: string,
}

export const getProfile = async (accessToken: string): Promise<ProfileData> => {
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);

  // Find user
  const user = await User.findById(verified.userId);
  if (!user) throw new HTTPError("Could not find user profile", 404);

  // Ensure user role allows for profile viewing
  if (verified.userId !== user.id && verified.userRole >= 30) {
    throw new HTTPError("User not authorized to view this profile", 401);
  };

  return {
    userId: user.id,
    userRole: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}