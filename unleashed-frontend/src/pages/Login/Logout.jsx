import { useEffect } from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { logout } from "../../service/AuthService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

function Logout({ isDashboard }) {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const token = useAuthHeader()
  const {
    emptyCart,
  } = useCart();


  useEffect(() => {
    const logoutUser = async () => {
      await logout(token);
    }
    logoutUser();
    signOut();
    emptyCart();
    navigate("/");
  }, [isDashboard, navigate, signOut, emptyCart, token]);
}

export default Logout;
