import "server-only";
import { HTTPError } from "../errors";
import { User } from "../models/User";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../tokens";
import { v4 } from "uuid";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

export interface TokenPackage {
  refreshToken: string,
  accessToken: string,
}

export const refreshTokens = async (oldToken?: string): Promise<TokenPackage> => {
    // Validate refresh token
    if (!oldToken) throw new HTTPError("No token provided", 401);
    const verified = await verifyRefreshToken(oldToken);
    if (!verified) throw new HTTPError("Unverified refresh token", 401);

    // Check jti
    const user = await User.findById(verified.userId);
    if (!user) throw new HTTPError("No user found", 404);
    if (!user.jti || user.jti !== verified.jti) throw new HTTPError("Invalid refresh token", 401);

    // Get new access token
    const payload = { userId: verified.userId, userRole: verified.userRole };
    const accessToken = await createAccessToken(payload);

    // Create new jti and save to user
    const jti = v4();
    user.jti = jti;
    await user.save();


    /* // TESTING todo
    const updatedUser = await User.findById(user.id);
    if (updatedUser) console.log("user jti: ", updatedUser.jti);
    console.log("new jti: ", jti); */

    
    // Create refresh token with new jti
    const newRefreshToken = await createRefreshToken({ ...payload, jti });
    return { refreshToken: newRefreshToken, accessToken };
}