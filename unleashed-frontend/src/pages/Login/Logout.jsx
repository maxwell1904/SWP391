import { useEffect, useRef } from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { logout } from "../../service/AuthService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { clearAuthCookies, notifyAuthSessionChanged } from "../../utils/authSession";

function Logout({ isDashboard }) {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const token = useAuthHeader();
  const hasStartedLogout = useRef(false);
  const {
    emptyCart,
  } = useCart();


  useEffect(() => {
    if (hasStartedLogout.current) {
      return;
    }

    hasStartedLogout.current = true;

    const logoutUser = async () => {
      try {
        await logout(token);
      } finally {
        signOut();
        clearAuthCookies();
        notifyAuthSessionChanged("logout");
        emptyCart();
        navigate("/", { replace: true });
      }
    }
    logoutUser();
  }, [isDashboard, navigate, signOut, emptyCart, token]);

  return null;
}

export default Logout;
