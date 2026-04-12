import { CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, types = "" }) => {
  const isAuth = useIsAuthenticated();
  const [isCheckingEmail, setIsCheckingEmail] = useState(
    types.includes("REGISTER")
  );
  const authHeader = useAuthHeader();
  const email = localStorage.getItem("mail");

  // Decode the token to get user info, if available
  const token = authHeader;
  const user = token ? jwtDecode(token) : null;
  const userRole = user?.role?.[0]?.authority;




  useEffect(() => {
    if (types.includes("REGISTER")) {
      setIsCheckingEmail(false);
    }
  }, [types]);

  // Define checks for route permissions
  if (types.includes("GUEST") && !isAuth) {
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return <Navigate to="/Dashboard" />;
    }
    return children;
  }

  if (types.includes("CUSTOMER") && isAuth) {
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return <Navigate to="/Dashboard" />;
    } else if (userRole === "REGISTER" && !isAuth) {
      return <Navigate to="/register/confirm-registration" />;
    }
    return children;
  }

  if (types.includes("REGISTER")) {
    if (isCheckingEmail) {
      return <CircularProgress />;
    }
    if (email) {
      if (userRole === "ADMIN" || userRole === "STAFF") {
        return <Navigate to="/Dashboard" />;
      }
      return children;
    }
  }



  // Default redirect if conditions aren't met
  return <Navigate to="/" />;
};
