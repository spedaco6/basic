import { SALT_ROUNDS } from "../const";
import { HTTPError } from "../errors";
import { User } from "../models/User";
import { createResetToken, verifyAccessToken, verifyResetToken } from "../tokens";
import bcrypt from "bcrypt";
import xss from "xss";
import { isEmail } from "../validation";
import { sendResetToken } from "../email";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

export interface ProfileData {
  userId: number,
  userRole: number,
  email: string,
  firstName: string,
  lastName: string,
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
  profile: Omit<ProfileData, "userId" | "userRole">,
  accessToken: string, 
): Promise<ProfileData> => {

  // Sanitize data
  const validatedProfile: Partial<ProfileData> = {};
  validatedProfile["email"] = xss(profile.email).trim();
  validatedProfile["firstName"] = xss(profile.firstName).trim();
  validatedProfile["lastName"] = xss(profile.lastName).trim();
  
  
  // Validate data
  const validationErrors = [];
  const matches = validatedProfile.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i);
  if (!matches) validationErrors.push("Invalid email");
  if (validationErrors.length) throw new HTTPError(
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

export const changePassword = async (
  currentPassword: string, 
  newPassword: string, 
  confirmPassword: string, 
  accessToken?: string
): Promise<void> => {
  const password = xss(currentPassword).trim();
  const updatedPassword = xss(newPassword).trim();

  // Validate
  const validationErrors = [];
  if (updatedPassword.length < 8) validationErrors.push("Passwords must be 8 characters");
  const matches = updatedPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
  if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
  if (confirmPassword !== updatedPassword) validationErrors.push("Passwords do not match");
  if (validationErrors.length) throw new HTTPError("New password is invalid", 422, validationErrors);

  // Authenticate / Authorize
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const payload = await verifyAccessToken(accessToken);
  if (!payload) throw new HTTPError("Invalid token", 401);
  // Find user
  const user = await User.findById(payload.userId);
  if (!user) throw new HTTPError("Could not find user", 404);
  // Authenticate password
  const compare = await bcrypt.compare(password, user.password); 
  if (!compare) throw new HTTPError("Incorrect password", 403);
  
  // Hash and save new password
  const hash = await bcrypt.hash(updatedPassword, SALT_ROUNDS);
  user.password = hash;
  await user.save();
}

export const forgotPassword = async (email: string) => {
  // validate email
  const userEmail = xss(email).trim();
  if (!userEmail || !isEmail(userEmail)) throw new HTTPError("Invalid email", 422);

  // find user
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new HTTPError("Could not find an account with that email", 404);
  
  // Save reset token to user
  const token = await createResetToken({ userId: user.id, userRole: user.role });
  user.resetToken = token;
  await user.save();

  // Send reset email
  await sendResetToken(user.email, token);
}

export const resetPassword = async (newPassword: string, confirmPassword: string, token: string) => {
  // Validate password
  const newPass = xss(newPassword).trim();
  const conPass = xss(confirmPassword).trim();
  
  // Validate
  const validationErrors = [];
  if (newPass.length < 8) validationErrors.push("Passwords must be 8 characters");
  const matches = newPass.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
  if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
  if (conPass !== newPass) validationErrors.push("Passwords do not match");
  if (validationErrors.length) throw new HTTPError("New password is invalid", 422, validationErrors);

  // verify token
  if (!token) throw new HTTPError("No reset token provided", 401);
  const verified = await verifyResetToken(token);
  if (!verified) throw new HTTPError("Unverified token", 401);

  // find user and match token
  const user = await User.findById(verified.userId);
  if (!user) throw new HTTPError("Could not find user", 404);
  if (user.resetToken !== token) throw new HTTPError("Token mismatch", 401);

  // Save new password
  const hash = await bcrypt.hash(newPass, SALT_ROUNDS);
  user.password = hash;
  user.resetToken = "";
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