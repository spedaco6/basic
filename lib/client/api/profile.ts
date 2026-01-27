import { ProfileData } from "@/lib/server/api/profile";
import { getToken } from "../tokens";


export const getProfile = async (): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
}

export const postProfile = async (profile: Partial<ProfileData>): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(profile),
  });
}

export const putProfile = async (profile: Partial<ProfileData>): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile", {
    method: "put",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(profile),
  })
}

export const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile/password/change", {
    method: "put",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    })
  });
}

export const forgotPassword = async (email: string): Promise<Response> => {
  return fetch("/api/profile/password/forgot", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (
  newPassword: string, 
  confirmPassword: string, 
  resetToken: string
) => {
  return fetch("/api/profile/password/reset", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + resetToken,
    },
    body: JSON.stringify({
      newPassword,
      confirmPassword,
    }),
  })
};
