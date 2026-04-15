import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { RegisterUser } from "../../service/AuthService";
import { LoginGooglebtn, RegisterBtn } from "../buttons/Button";
import { Checkbox, Divider } from "@mui/material";
import { toast, Zoom } from "react-toastify";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import TermsAndPrivacyModals from "../modals/Term";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const signIn = useSignIn();
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(7, "Username must be at least 7 characters")
      .matches(
        /^[a-zA-Z0-9]*$/,
        "Username cannot contain special characters or spaces"
      ),
    fullname: Yup.string()
      .required("Full name is required")
      .matches(
        /^[\p{L} .'-]+$/u,
        "Full name can only contain letters, spaces, dots, apostrophes, and hyphens."
      ),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phoneNumber: Yup.string()
      .matches(
        /^(?:\+84|0)\d{9,10}$/,
        "Phone number must start with '+84' or '0' and be 10-11 digits"
      )
      .required("Phone number is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain one uppercase, one lowercase, and one number"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const onSubmit = async (values) => {
    try {
      await RegisterUser(values, navigate);
    } catch (error) {
      // Handle registration error
      toast.error("Error during registration: " + error?.data?.message, {
        position: "top-center",
        transition: Zoom,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-['Oswald'] text-sm uppercase tracking-[0.55em] text-red-500">
          Member Onboarding
        </p>
        <h2
          className="mb-4 text-5xl text-white md:text-6xl"
          style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}
        >
          REGISTER
        </h2>
        <p className="max-w-lg font-poppins text-sm leading-7 text-white/60 md:text-base">
          Build your account to shop faster, track your orders, and stay in the
          loop with every collection update.
        </p>
      </div>
      <Formik
        initialValues={{
          username: "",
          fullname: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                Username
              </label>
              <Field
                type="text"
                name="username"
                placeholder="Enter your username"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="username"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                Full name
              </label>
              <Field
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="fullname"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                Email
              </label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                Phone Number
              </label>
              <Field
                type="text"
                name="phoneNumber"
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="phoneNumber"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                  Password
                </label>
                <button
                  type="button"
                  className="flex items-center text-sm font-medium text-white/55 transition hover:text-white"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <>
                      <BiSolidHide className="mr-1 text-2xl text-white/70" />
                      Hide
                    </>
                  ) : (
                    <>
                      <BiSolidShow className="mr-1 text-2xl text-white/70" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="password"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="flex items-center text-sm font-medium text-white/55 transition hover:text-white"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <>
                      <BiSolidHide className="mr-1 text-2xl text-white/70" />
                      Hide
                    </>
                  ) : (
                    <>
                      <BiSolidShow className="mr-1 text-2xl text-white/70" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <Field
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
              />
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className="pt-2 text-sm text-red-400"
              />
            </div>
            <div className="agreeTerm flex items-start gap-2">
              <Checkbox
                required
                sx={{ color: "rgba(255,255,255,0.5)", "&.Mui-checked": { color: "#ef4444" } }}
              />
              <p className="pt-1 text-left font-poppins text-sm leading-7 text-white/65">
                By continuing, you agree to the <TermsAndPrivacyModals />
              </p>
            </div>
            <RegisterBtn disabled={isSubmitting} />
          </Form>
        )}
      </Formik>
      <div className="pt-5 text-center">
        <p className="font-poppins text-white/65">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-red-400 underline transition hover:text-red-300"
          >
            Sign in
          </Link>
        </p>
      </div>
      <div className="otherLogin flex flex-col pt-8">
        <Divider sx={{ color: "rgba(255,255,255,0.35)", "&::before, &::after": { borderColor: "rgba(255,255,255,0.12)" } }}>
          Or continue with
        </Divider>
        <div className="loginWithGoogle flex pt-5 justify-center">
          <LoginGooglebtn signIn={signIn} />
        </div>
      </div>
    </div>
  );
}
