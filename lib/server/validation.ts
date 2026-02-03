import "server-only";

export const isEmail = (email: string) => {
  const trimmed = email.trim();
  const matches = trimmed.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i);
  if (!matches) return false;
  return true;
}