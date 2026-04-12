import React from "react";
import { Navigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";

const PrivateRoute = ({ children, requiredRoles, isLoginForm }) => {
  const isAuth = useIsAuthenticated();
  const authUser = useAuthUser();

  if (isLoginForm) {
    if (isAuth) {
      return <Navigate to="/Dashboard" />;
    } else {
      return children;
    }
  }

  try {
    if (!isAuth) {
      return <Navigate to="/" />;
    }

    const userRole = authUser.role;

    if (!userRole) {
      return <Navigate to="/" />;
    }

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      if (userRole === "CUSTOMER") {
        return <Navigate to="/" />;
      } else if (userRole === "STAFF") {
        return <Navigate to="/Dashboard" />;
      }
    }

    return children;
  } catch (error) {
    console.error("Error in PrivateRoute:", error);

    return <Navigate to="/LoginForStaffAndAdmin" />;
  }
};

export default PrivateRoute;
