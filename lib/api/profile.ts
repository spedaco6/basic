import { access } from "fs";
import { HTTPError } from "../server/errors";
import { User } from "../server/models/User";
import { verifyAccessToken } from "../server/tokens";
import xss from "xss";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

interface ProfileData {
  userId: number,
  userRole: number,
  email: string,
  firstName?: string,
  lastName?: string,
}

export const getProfile = async (accessToken?: string): Promise<ProfileData> => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
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

export const updateProfile = async (
  profile: ProfileData,
  accessToken: string, 
): Promise<ProfileData> => {

  // Sanitize data
  const validatedProfile: Partial<ProfileData> = {};
  validatedProfile["email"] = xss(profile.email).trim();
  validatedProfile["firstName"] = profile.firstName ? xss(profile.firstName).trim() : "";
  validatedProfile["lastName"] = profile.lastName ? xss(profile.lastName).trim() : "";

  // Validate data
  const validationErrors = [];
  const matches = validatedProfile.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ /i);
  if (!matches) validationErrors.push("Invalid email");
  if (validationErrors) throw new HTTPError(
    "Invalid profile information provided", 
    422, 
    validationErrors
  );

  // Verify token
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Token could not be verified", 401);

  // Find user for update
  const user = await User.findById(verified.userId);
  if (!user) throw new HTTPError("Could not find user profile", 404);

  Object.assign(user, validatedProfile);
  await user.save();

  return {
    userId: user.id,
    userRole: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}