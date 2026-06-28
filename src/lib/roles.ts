export type AppRole = "Admin" | "Editor" | "User";

export function normalizeRole(role: string | null | undefined): AppRole {
  const value = (role || "").trim().toLowerCase();

  if (value === "admin" || value === "super admin") {
    return "Admin";
  }

  if (value === "editor") {
    return "Editor";
  }

  return "User";
}

export function canAccessAdminPanel(role: string | null | undefined) {
  const normalized = normalizeRole(role);
  return normalized === "Admin" || normalized === "Editor";
}

export function canManageAll(role: string | null | undefined) {
  return normalizeRole(role) === "Admin";
}

export function canWriteArticles(role: string | null | undefined) {
  const normalized = normalizeRole(role);
  return normalized === "Admin" || normalized === "Editor";
}