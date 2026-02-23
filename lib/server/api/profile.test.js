// tests/profiles.test.ts
import { describe, test, expect, beforeEach, vi } from "vitest";
import * as profiles from "./profile"; // your module
import { User } from "../models/User";
import { verifyAccessToken, verifyResetToken, createResetToken } from "../tokens";
import { sendResetToken } from "../email";
import bcrypt from "bcrypt";
import { HTTPError } from "../errors";

// Mocks
vi.mock("../models/User", () => {
  // all code inside factory
  class MockUser {
    constructor(data) {
      Object.assign(this, data);
    }
    save = vi.fn();
    delete = vi.fn();
    static findById = vi.fn();
    static findOne = vi.fn();
    static find = vi.fn();
  }
  return { User: MockUser };
});
vi.mock("../tokens");
vi.mock("../email");
vi.mock("bcrypt");
vi.mock("server-only", () => ({}));

describe("Profiles Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------
  // getProfile
  // -----------------------
  describe("getProfile", () => {
    test("throws if no token", async () => {
      await expect(profiles.getProfile()).rejects.toBeInstanceOf(HTTPError);
    });

    test("throws if token invalid", async () => {
      (verifyAccessToken).mockResolvedValue(null);
      await expect(profiles.getProfile("token")).rejects.toBeInstanceOf(HTTPError);
    });

    test("throws if user not found", async () => {
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 10 });
      (User.findById).mockResolvedValue(null);
      await expect(profiles.getProfile("token")).rejects.toBeInstanceOf(HTTPError);
    });

    test("returns profile if valid", async () => {
      const user = new User({ id: 1, email: "test@test.com", role: 10, firstName: "A", lastName: "B" });
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 10 });
      (User.findById).mockResolvedValue(user);

      const profile = await profiles.getProfile("token");
      expect(profile).toEqual({
        id: 1,
        role: 10,
        email: "test@test.com",
        firstName: "A",
        lastName: "B",
      });
    });
  });

  // -----------------------
  // createProfile
  // -----------------------
  describe("createProfile", () => {
    test("throws if user exists", async () => {
      (User.findOne).mockResolvedValue(new User({ email: "exists@test.com" }));
      await expect(profiles.createProfile({ email: "exists@test.com", password: "Abcd123!" }, "token"))
        .rejects.toBeInstanceOf(HTTPError);
    });

    test("creates new user successfully", async () => {
      (User.findOne).mockResolvedValue(null);
      (verifyAccessToken).mockResolvedValue({ userId: 1 });

      await expect(profiles.createProfile({ email: "new@test.com", password: "Abcd123!" }, "token"))
        .resolves.toBeUndefined();

      expect(User.findOne).toHaveBeenCalledWith({ email: "new@test.com" });
    });
  });

  // -----------------------
  // updateProfile
  // -----------------------
  describe("updateProfile", () => {
    test("throws if no user found", async () => {
      (User.findOne).mockResolvedValue(null);
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 10 });

      await expect(profiles.updateProfile({ 
        email: "nonexist@test.com", 
        firstName: "New", 
        lastName: "User",
        password: "password",
        role: 30,
        id: 23,
      }, "token"))
        .rejects.toBeInstanceOf(HTTPError);
    });

    test("updates profile successfully", async () => {
      const user = new User({ id: 1, email: "test@test.com", role: 10, firstName: "A", lastName: "B" });
      (User.findOne).mockResolvedValue(user);
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 10 });

      const result = await profiles.updateProfile({ 
        email: "nonexist@test.com", 
        firstName: "New", 
        lastName: "User",
        password: "password",
        role: 30,
        id: 23,
      }, "token");
      expect(result.firstName).toBe("New");
      expect(user.save).toHaveBeenCalled();
    });
  });

  // -----------------------
  // deleteProfile
  // -----------------------
  describe("deleteProfile", () => {
    test("throws if token missing", async () => {
      await expect(profiles.deleteProfile("password")).rejects.toBeInstanceOf(HTTPError);
    });

    test("throws if password invalid", async () => {
      const user = new User({ id: 1, password: "hashedPassword" });
      (verifyAccessToken).mockResolvedValue({ userId: 1 });
      (User.findById).mockResolvedValue(user);
      (bcrypt.compare).mockResolvedValue(false);

      await expect(profiles.deleteProfile("wrong", "token")).rejects.toBeInstanceOf(HTTPError);
    });

    test("deletes user successfully", async () => {
      const user = new User({ id: 1, password: "hashedPassword" });
      (verifyAccessToken).mockResolvedValue({ userId: 1 });
      (User.findById).mockResolvedValue(user);
      (bcrypt.compare).mockResolvedValue(true);

      await expect(profiles.deleteProfile("correct", "token")).resolves.toBeUndefined();
      expect(user.delete).toHaveBeenCalled();
    });
  });

  // -----------------------
  // changePassword
  // -----------------------
  describe("changePassword", () => {
    test("throws if current password invalid", async () => {
      const user = new User({ id: 1, password: "hashedPassword" });
      (verifyAccessToken).mockResolvedValue({ userId: 1 });
      (User.findById).mockResolvedValue(user);
      (bcrypt.compare).mockResolvedValue(false);

      await expect(profiles.changePassword("wrong", "Abcd123!", "Abcd123!", "token"))
        .rejects.toBeInstanceOf(HTTPError);
    });

    test("changes password successfully", async () => {
      const user = new User({ id: 1, password: "hashedPassword" });
      (verifyAccessToken).mockResolvedValue({ userId: 1 });
      (User.findById).mockResolvedValue(user);
      (bcrypt.compare).mockResolvedValue(true);
      (bcrypt.hash).mockResolvedValue("newHashedPassword");

      await expect(profiles.changePassword("currentPass", "Abcd123!", "Abcd123!", "token"))
        .resolves.toBeUndefined();

      expect(user.password).toBe("newHashedPassword");
      expect(user.save).toHaveBeenCalled();
    });
  });

  // -----------------------
  // forgotPassword
  // -----------------------
  describe("forgotPassword", () => {
    test("throws if email invalid", async () => {
      await expect(profiles.forgotPassword("invalid-email")).rejects.toBeInstanceOf(HTTPError);
    });

    test("sends reset token successfully", async () => {
      const user = new User({ id: 1, email: "test@test.com" });
      (User.findOne).mockResolvedValue(user);
      (createResetToken).mockResolvedValue("resettoken");

      await expect(profiles.forgotPassword("test@test.com")).resolves.toBeUndefined();
      expect(user.resetToken).toBe("resettoken");
      expect(user.save).toHaveBeenCalled();
      expect(sendResetToken).toHaveBeenCalledWith("test@test.com", "resettoken");
    });
  });

  // -----------------------
  // resetPassword
  // -----------------------
  describe("resetPassword", () => {
    test("throws if token invalid", async () => {
      (verifyResetToken).mockResolvedValue(null);
      await expect(profiles.resetPassword("Abcd123!", "Abcd123!", "token")).rejects.toBeInstanceOf(HTTPError);
    });

    test("resets password successfully", async () => {
      const user = new User({ id: 1, resetToken: "token" });
      (verifyResetToken).mockResolvedValue({ userId: 1 });
      (User.findById).mockResolvedValue(user);
      (bcrypt.hash).mockResolvedValue("newHashed");

      await expect(profiles.resetPassword("Abcd123!", "Abcd123!", "token")).resolves.toBeUndefined();
      expect(user.password).toBe("newHashed");
      expect(user.resetToken).toBe("");
      expect(user.save).toHaveBeenCalled();
    });
  });

  // -----------------------
  // Permissions functions
  // -----------------------
  describe("permissions", () => {
    test("getAuthorizedProfiles returns filtered users", async () => {
      const users = [new User({ id: 1, role: 10, email: "a@test.com" })];
      (verifyAccessToken).mockResolvedValue({ userId: 2, userRole: 10 });
      (User.find).mockResolvedValue(users);

      const result = await profiles.getAuthorizedProfiles("token");
      expect(result).toEqual([{ id: 1, role: 10, email: "a@test.com", firstName: undefined, lastName: undefined }]);
    });

    test("updatePermissions updates role successfully", async () => {
      const user = new User({ id: 2, role: 10, email: "a@test.com" });
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 20 });
      (User.findOne).mockResolvedValue(user);

      const result = await profiles.updatePermissions({ email: "a@test.com", role: 20 }, "token");
      expect(result.role).toBe(20);
      expect(user.save).toHaveBeenCalled();
    });

    test("revokePermissions sets role to 50", async () => {
      const user = new User({ id: 2, role: 20 });
      (verifyAccessToken).mockResolvedValue({ userId: 1, userRole: 10 });
      (User.findById).mockResolvedValue(user);

      await expect(profiles.revokePermissions(2, "token")).resolves.toBeUndefined();
      expect(user.role).toBe(50);
      expect(user.save).toHaveBeenCalled();
    });
  });
});