import { HTTPError } from "../server/errors";
import { User } from "../server/models/User";
import { verifyAccessToken } from "../server/tokens";
import bcrypt from "bcrypt";
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

export const changePassword = async (currentPassword: string, newPassword: string, accessToken?: string): Promise<void> => {
  const password = xss(currentPassword).trim();
  const updatedPassword = xss(newPassword).trim();

  // Validate
  const validationErrors = [];
  if (updatedPassword.length < 8) validationErrors.push("Passwords must be 8 characters");
  const matches = updatedPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
  if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
  if (validationErrors) throw new HTTPError("New password is invalid", 422, validationErrors);

  // Authenticate / Authorize
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const payload = await verifyAccessToken(accessToken);
  if (!payload) throw new HTTPError("Invalid token", 401);

  // Find user
  const user = await User.findById(payload.userId);
  if (!user) throw new HTTPError("Could not find user", 404);
  
  // Authenticate password
  const compare = bcrypt.compare(password, user.password);  
  if (!compare) throw new HTTPError("Incorrect password", 403);

  // Hash and save new password
  const hash = await bcrypt.hash(updatedPassword, 10);
  user.password = hash;
  await user.save();
}

export const deleteProfile = async (currentPassword: string, accessToken?: string): Promise<void> => {
  // Verify token
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Token could not be verified", 401);

  // Find user for update
  const user = await User.findById(verified.userId);
  if (!user) throw new HTTPError("Could not find user profile", 404);

  // validate password
  const compare = await bcrypt.compare(currentPassword, user.password);
  if (!compare) throw new HTTPError("Incorrect password", 403);

  await user.delete();
}