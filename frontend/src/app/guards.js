const roleHomeByName = {
  USER: "/user/dashboard",
  CASHIER: "/cashier/dashboard",
  ADMIN: "/admin/dashboard"
};

const loginRouteByRole = {
  USER: "/login",
  CASHIER: "/login",
  ADMIN: "/login"
};

export function getRoleHome(role) {
  return roleHomeByName[role] ?? "/";
}

function normalizeRoleAccess(access) {
  if (!access || access === "public" || access === "guest") {
    return null;
  }

  if (typeof access === "object" && access.role) {
    return access.role;
  }

  return null;
}

export function evaluateRouteAccess(route, session) {
  const roleRequired = normalizeRoleAccess(route.access);

  if (route.access === "guest" && session.authenticated) {
    return { redirectTo: getRoleHome(session.role) };
  }

  if (!roleRequired) {
    return { allow: true };
  }

  if (!session.authenticated) {
    return {
      redirectTo: `${loginRouteByRole[roleRequired]}?next=${encodeURIComponent(route.path)}`
    };
  }

  if (session.role !== roleRequired) {
    return { redirectTo: getRoleHome(session.role) };
  }

  return { allow: true };
}
