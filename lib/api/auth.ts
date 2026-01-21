import xss from "xss";
import { TokenPackage } from "./tokens";
import { User } from "../server/models/User";
import { HTTPError } from "../server/errors";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken, verifyAccessToken } from "../server/tokens";
import { v4 } from "uuid";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

export const login = async (email?: string, password?: string): Promise<TokenPackage> => {
  // Sanitize and validate data
  if (!email || !password) throw new HTTPError("Incorrect email or password", 403);
  const userEmail = xss(email).trim();
  const userPassword = xss(password).trim();
  
  // Authenticate user
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new HTTPError("Incorrect email or password", 403);
  
  // validate password
  const compare = await bcrypt.compare(userPassword, user.password);
  if (!compare) throw new HTTPError("Incorrect email or password", 403);
    
  // Create access token
  const payload = { userId: user.id, userRole: user.role };
  const accessToken = await createAccessToken(payload);

  // Create jti and save to user
  const jti = v4();
  user.jti = jti;
  await user.save();

  // Create refresh token
  const refreshToken = await createRefreshToken({ ...payload, jti });

  return { refreshToken, accessToken };
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