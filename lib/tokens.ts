export const getToken = async (): Promise<string> => {
  // Try to get existing token
  const token = localStorage.getItem("token");
  if (token) return new Promise(res => res(token));

  // Try to refresh token;
  const newToken = await refreshToken();
  localStorage.setItem("token", newToken);
  return newToken;
}

export const refreshToken = async (): Promise<string> => {
  // Try to refresh token
  const response = await fetch("/api/refresh");
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message ?? "Could not refresh token");
  return result.token;
}