import xss from "xss";
import { TokenPackage } from "./tokens";
import { User } from "../server/models/User";
import { HTTPError } from "../server/errors";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../server/tokens";
import { v4 } from "uuid";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

export const login = async (userEmail?: string, userPassword?: string): Promise<TokenPackage> => {
  // Sanitize and validate data
  if (!userEmail || !userPassword) throw new HTTPError("Incorrect email or password", 403);
  const email = xss(userEmail).trim();
  const password = xss(userPassword).trim();
  
  // Authenticate user
  const user = await User.findOne({ email });
  if (!user) throw new HTTPError("Incorrect email or password", 403);
  
  // validate password
  const compare = await bcrypt.compare(password, user.password);
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