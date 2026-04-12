import React from "react";
import { Link } from "react-router-dom";
import success from "../../assets/images/success.svg";

function ForgotSuccess(){
    return(
                <section className="relative min-h-[calc(100vh-92px)] overflow-hidden bg-[#050505] text-white">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.25),transparent_30%)]" />
                        <div className="relative mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-3xl items-center justify-center px-6 py-12 md:px-10">
                            <div className="w-full rounded-[32px] border border-white/10 bg-[#0b0b0b]/95 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-12">
                                <p className="mb-3 font-['Oswald'] text-sm uppercase tracking-[0.55em] text-red-500">
                                    Recovery Sent
                                </p>
                                <h1
                                    className="mb-5 text-5xl text-white md:text-6xl"
                                    style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}
                                >
                                    CHECK YOUR INBOX
                                </h1>
                                <p className="mx-auto max-w-2xl font-poppins text-sm leading-7 text-white/65 md:text-base">
                                    We just sent a password reset email to your address. Open the
                                    link in that email to continue setting a new password.
                                </p>
                                <img src={success} className="mx-auto mt-10 w-56 md:w-72" alt="Password reset email sent" />
                                <div className="mt-9">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center rounded-full border border-red-500/45 bg-[linear-gradient(135deg,#ef4444_0%,#b91c1c_100%)] px-8 py-3 font-poppins text-base font-semibold text-white shadow-[0_18px_32px_rgba(127,29,29,0.28)] transition hover:border-red-300/55"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
            </div>
                </section>
    );
}

export default ForgotSuccess;