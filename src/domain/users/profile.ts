import { isPlaceholderStudentName } from "./service";

export function isProfileComplete(input: { name: string; phone: string | null }): boolean {
  if (isPlaceholderStudentName(input.name)) return false;
  const digits = (input.phone ?? "").replace(/\D/g, "");
  return input.name.trim().length >= 2 && digits.length >= 10;
}
