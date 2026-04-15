import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ForgotBtn } from "../buttons/Button";
import { HandleForgotPassword } from "../../service/AuthService";

export function ForgotForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // console.log(data);
      await HandleForgotPassword(data, navigate);
    } catch (error) {
      console.error("Error during login:", error.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-3 font-['Oswald'] text-sm uppercase tracking-[0.55em] text-red-500">
          Recovery Mode
        </p>
        <h2
          className="mb-4 text-5xl text-white md:text-6xl"
          style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}
        >
          FORGOT PASSWORD
        </h2>
        <p className="max-w-lg font-poppins text-sm leading-7 text-white/60 md:text-base">
          Enter the email associated with your account. We will send you a
          secure link to set a new password.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
            Your email
          </label>
          <input
            type="email"
            tabIndex={1}
            placeholder="Enter your email"
            className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 text-base text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-red-500 focus:ring-0"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="pt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
        <ForgotBtn disabled={isSubmitting} />
      </form>
      <div className="pt-6 text-center">
        <p className="font-poppins text-white/65">
          Back to{" "}
          <Link
            to="/login"
            className="font-medium text-red-400 underline transition hover:text-red-300"
          >
            Sign in
          </Link>
        </p>
      </div>
      <p className="pt-5 text-center font-poppins text-sm text-white/45">
        Reset email may take a few minutes depending on your provider.
      </p>
    </div>
  );
}
