import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { LoginUser, logout } from "../../service/AuthService";
import { Divider } from "@mui/material";
import { InputField } from "../inputs/InputField";
import { LoginBtn, LoginGooglebtn } from "../buttons/Button";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import Cookies from 'js-cookie';


const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username can't be blank"),
  password: Yup.string()
    .required("Password is required")
});

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // const handleRememberMeChange = () => {
  //   setRememberMe((prev) => !prev);
  // };

  const onSubmit = async (values, { setSubmitting }) => {
    const authType = Cookies.get("_auth_type");
    const authToken = Cookies.get("_auth");

    if (authType && authToken) { // Check if both cookies exist
      const token = authType + " " + authToken;

      if (token) { // Check if token exists
        await logout(token);
      }
    }

    await LoginUser(values, navigate, signIn, signOut);
    setSubmitting(false);

  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-['Oswald'] text-sm uppercase tracking-[0.55em] text-red-500">
          Member Access
        </p>
        <h2 className="mb-4 text-5xl text-white md:text-6xl" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
          LOGIN
        </h2>
        <p className="max-w-lg font-poppins text-sm leading-7 text-white/60 md:text-base">
          Sign in to track orders, manage your wishlist, and stay close to the latest drop.
        </p>
      </div>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Username or Email Input */}
            <InputField
              label="Username or Email"
              name="username"
              placeholder="Enter your username or email"
              tabIndex={1}
              labelClassName="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55"
              fieldClassName="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              errorClassName="pt-2 text-sm text-red-400"
            />
            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">Password</label>
                <button
                  type="button"
                  className="flex items-center text-sm font-medium text-white/55 transition hover:text-white swap"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <>
                      <BiSolidHide className="mr-1 text-2xl text-white/70" />{" "}
                      Hide
                    </>
                  ) : (
                    <>
                      <BiSolidShow className="mr-1 text-2xl text-white/70" />{" "}
                      Show
                    </>
                  )}
                </button>
              </div>
              <InputField
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                tabIndex={2}
                fieldClassName="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
                errorClassName="pt-2 text-sm text-red-400"
              />
            </div>

            {/* <AnimatedCheckbox handleRememberMeChange={handleRememberMeChange} rememberMe={rememberMe}/> */}

            <LoginBtn />
          </Form>
        )}
      </Formik>
      <div className="OtherFeature pt-8 flex justify-center">
        <Link to="/forgotPassword">
          <p className="font-semibold font-montserrat text-white/70 underline transition hover:text-red-400">
            Forgot password?
          </p>
        </Link>
      </div>
      <div className="register flex justify-center pt-5">
        <p className="font font-montserrat text-white/65">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="underline font-medium font-montserrat text-red-400 transition hover:text-red-300"
          >
            Sign up
          </Link>
        </p>
      </div>
      <div className="otherLogin py-10">
        <Divider sx={{ color: "rgba(255,255,255,0.35)", "&::before, &::after": { borderColor: "rgba(255,255,255,0.12)" } }}>
          Or continue with
        </Divider>
      </div>
      <div className="otherLogin flex flex-col items-center">
        <LoginGooglebtn signIn={signIn} />
      </div>
    </div>
  );
}
