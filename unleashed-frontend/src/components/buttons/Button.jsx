import React from "react";
import { FaCartPlus, FaShareAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { HandleLoginGoogle, logout } from "../../service/AuthService";
import Cookies from "js-cookie";

export function AddToCart({ onClick, tabindex = "0" }) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabindex}
      className="bg-white text-blue-500 font-bold py-2 px-4 rounded flex items-center mx-2 hover:bg-gray-50 transition-opacity duration-300"
    >
      <FaCartPlus className="mr-2" />
      Add to cart
    </button>
  );
}

export function Share({ onClick, tabindex = "0" }) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabindex}
      className="bg-transparent text-white font-bold py-2 px-4 rounded flex items-center mx-2 transition-opacity duration-300 hover:bg-zinc-500 bg-opacity-20"
    >
      <FaShareAlt className="mr-2" /> Share
    </button>
  );
}

export function ShowMore({ onClick, tabindex = "0" }) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabindex}
      className="bg-white text-blue-700 font-semibold font-poppins border border-blue-700 rounded-md py-2 px-4 flex items-center hover:bg-blue-700 hover:text-white transition duration-300"
    >
      Show More
    </button>
  );
}

export function LoginBtn({ onClick, tabindex = 0, sxOverride = {} }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      tabIndex={Number(tabindex)}
      type="submit"
      sx={{
        width: "100%",
        color: "#ffffff",
        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        borderRadius: "999px",
        borderColor: "rgba(239, 68, 68, 0.4)",
        textTransform: "none",
        fontSize: "1.1rem",
        fontWeight: 600,
        fontFamily: "Poppins",
        paddingY: "0.75rem",
        boxShadow: "0 18px 32px rgba(127, 29, 29, 0.28)",
        "&:hover": {
          background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
          borderColor: "rgba(248, 113, 113, 0.5)",
        },
        ...sxOverride,
      }}
    >
      Login
    </Button>
  );
}

export function ForgotBtn({ onClick, tabindex = 0, disabled = false }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      tabIndex={Number(tabindex)}
      type="submit"
      disabled={disabled}
      sx={{
        width: "100%",
        color: "#ffffff",
        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        textTransform: "none",
        borderRadius: "999px",
        borderColor: "rgba(239, 68, 68, 0.4)",
        fontSize: "1.1rem",
        fontWeight: 600,
        fontFamily: "Poppins",
        paddingY: "0.75rem",
        boxShadow: "0 18px 32px rgba(127, 29, 29, 0.28)",
        "&:hover": {
          background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
          borderColor: "rgba(248, 113, 113, 0.5)",
        },
        "&.Mui-disabled": {
          color: "rgba(255,255,255,0.45)",
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.08)",
        },
      }}
    >
      Reset password
    </Button>
  );
}

export function RegisterBtn({ onClick, tabindex = 0, disabled = false }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      tabIndex={Number(tabindex)}
      type="submit"
      disabled={disabled}
      sx={{
        width: "100%",
        color: "#ffffff",
        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        borderRadius: "999px",
        textTransform: "none",
        borderColor: "rgba(239, 68, 68, 0.4)",
        fontSize: "1.1rem",
        fontWeight: 600,
        fontFamily: "Poppins",
        paddingY: "0.75rem",
        boxShadow: "0 18px 32px rgba(127, 29, 29, 0.28)",
        "&:hover": {
          background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
          borderColor: "rgba(248, 113, 113, 0.5)",
        },
        "&.Mui-disabled": {
          color: "rgba(255,255,255,0.45)",
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.08)",
        },
      }}
    >
      Register
    </Button>
  );
}

export function LoginGooglebtn({ signIn, className = "" }) {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const authType = Cookies.get("_auth_type");
      const authToken = Cookies.get("_auth");

      if (authType && authToken) {
        const token = authType + " " + authToken;

        if (token) {
          await logout(token);
        }
      } else {
        console.error("Auth cookies not found.");
      }

      const accessToken = tokenResponse.access_token;
      HandleLoginGoogle(accessToken, navigate, signIn);
    },
    ux_mode: "popup",
    scope: "openid email profile",
  });

  return (
    <button
      onClick={() => login()}
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition hover:border-red-500/50 hover:bg-white/[0.1] ${className}`}
    >
      <FcGoogle className="icon text-3xl" />
    </button>
  );
}

export const BuyNow = () => {
  return (
    <>
      <Link to={"/shop"}>
        <Button
          variant="contained"
          size="large"
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            width: "200px",
          }}
        >
          Buy Now
        </Button>
      </Link>
    </>
  );
};

export const CheckOut = ({ context, handleClick, isEmpty }) => {
  return (
    <>
      <Button
        variant="contained"
        size="large"
        sx={{
          borderRadius: "10px",
          textTransform: "none",
          width: "200px",
          backgroundColor: "white",
          color: "black",
          border: "solid black 1px",
        }}
        onClick={handleClick}
        disabled={isEmpty}
      >
        {context}
      </Button>
    </>
  );
};

export const Drawerbtn = ({ context, handleClick, isEmpty }) => {
  return (
    <Button
      variant="contained"
      onClick={() => handleClick()}
      fullWidth
      disabled={isEmpty}
      sx={{
        textTransform: "none",
        fontFamily: "Poppins",
        backgroundColor: "white",
        color: "black",
        border: "black solid 1px",
        borderRadius: "30px",
      }}
    >
      {context}
    </Button>
  );
};

export const ResetPasswordBtn = ({ tabIndex = 0 }) => {
  return (
    <Button
      variant="outlined"
      tabIndex={tabIndex}
      type="submit"
      sx={{
        width: "100%",
        color: "#000",
        backgroundColor: "#fff",
        borderRadius: "50px",
        borderColor: "#000",
        textTransform: "none",
        fontSize: "1.25rem",
        fontFamily: "Poppins",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      Confirm Password
    </Button>
  );
};

export const AuthCommonBtn = ({ tabIndex = 0, handleClick, context, type }) => {
  return (
    <Button
      variant="outlined"
      tabIndex={tabIndex}
      onClick={handleClick}
      type={type}
      sx={{
        width: "100%",
        color: "#ffffff",
        backgroundColor: "#648DDB",
        borderRadius: "50px",
        textTransform: "none",
        fontSize: "1.25rem",
        fontFamily: "Poppins",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          color: "#000000",
        },
      }}
    >
      {context}
    </Button>
  );
};
