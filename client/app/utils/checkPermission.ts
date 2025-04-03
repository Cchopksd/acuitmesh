export enum ROLES {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export const hasPermission = (userRole: ROLES, allowedRoles: ROLES[]) => {
  return allowedRoles.includes(userRole);
};
