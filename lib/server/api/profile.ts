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
const readonly = ["id", "created_at", "updated_at", "secureKey", "role"];
const editable = ["firstName", "lastName", "password", "email"];

export interface ProfileData {
  id: number,
  role: number,
  email: string,
  firstName?: string,
  lastName?: string,
  password: string,
}

export const getProfile = async (accessToken?: string): Promise<Omit<ProfileData, "password">> => {
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
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}

// Create a user
export const createProfile = async (
  profile: Partial<ProfileData>,
  accessToken: string
): Promise<void> => {
  // sanitize and validate
  const sanitized: Record<string, any> = {};
  Object.entries(profile).forEach(field => {
    sanitized[field[0]] = typeof field[1] === "string" ? xss(field[1]).trim() : field[1];
  });

  // authenticate/authorize
  let userId = null;
  if (accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (!verified) throw new HTTPError("Unverified token", 401);
    userId = verified.userId;
  }

  // Ensure user does not already exist
  const user = await User.findOne({ email: sanitized.email });
  if (user) throw new HTTPError("User already exists", 422);

  // validate data
  const validationErrors = [];
  if (!sanitized.email || !isEmail(sanitized.email)) validationErrors.push("Invalid email");
  // Ensure all passwords are at least 8 characters
  if (sanitized.password.length < 8) validationErrors.push("Passwords must be 8 characters");
  // Bypass password requirements when created by an authorized user
  if (!userId || userId > 20) {
    const matches = sanitized.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
    if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
  }
  if (validationErrors.length) throw new HTTPError("Invalid data", 422, validationErrors);
  
  // hash password
  const hash = await bcrypt.hash(sanitized.password, SALT_ROUNDS);

  // complete action
  const newUser = new User({
    firstName: sanitized.firstName ?? "",
    lastName: sanitized.lastName ?? "",
    email: sanitized.email,
    password: hash,
    role: 50,
  });

  await newUser.save();
}

export const updateProfile = async (
  profile: Omit<ProfileData, "userId" | "userRole">,
  accessToken: string, 
): Promise<Omit<ProfileData, "password">> => {
  // Sanitize user provided input
  const sanitized: Record<string, any> = {};
  for (const field in profile) {
    const val = typeof sanitized[field] === "string" ? xss(sanitized[field]) : field[1];
    sanitized[field] = val;
  }
  
  // Find target user for update
  const user = await User.findOne({ email: sanitized.email });
  if (!user) throw new HTTPError("Could not find user profile", 404);

  // Verify token of requesting user
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Token could not be verified", 401);

  // Validate data
  const validationErrors = [];
  if (!isEmail(sanitized.email)) validationErrors.push("Invalid email");
  if (sanitized.password.length < 8) validationErrors.push("Passwords must be 8 characters");
  const matches = sanitized.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
  if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");

  // Return validation errors if they exist
  if (validationErrors.length) throw new HTTPError(
    "Invalid profile information provided", 
    422, 
    validationErrors
  );

  // Filter fields to include only fields that are editable
  const desensitized: Record<string, any> = {};
  Object.entries(sanitized)
    .filter(([name]) => editable.includes(name))
    .forEach(entry => {
      desensitized[entry[0]] = entry[1];
    });

  // Update and save user profile
  Object.assign(user, desensitized);
  await user.save();

  // Return select updated profile information
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}

export const updatePermissions = async (body: Partial<ProfileData>, token: string): Promise<void> => {
  const email = body?.email ? xss(body?.email).trim() : "";
  let role = body?.role ?? 50;

  // Verify requesting user
  if (!token) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(token);
  if (!verified) throw new HTTPError("Unverified token", 401);
  const { userRole, userId } = verified;

  // Find user to be updated 
  const user = await User.findOne({ email });
  if (!user) throw new HTTPError("No user found", 404);

  // Update user if valid
  if (userId === user.id || role < userRole) throw new HTTPError("Unauthorized user", 401);
  
  // Update and save user
  user.role = role;
  await user.save();
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