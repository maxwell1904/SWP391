import React from "react";
import { LoginForm } from "../../components/forms/LoginForm";

export function Login() {
  return (
    <section className="relative min-h-[calc(100vh-92px)] overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.25),transparent_30%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl grid-cols-1 px-6 py-12 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
        <div className="hidden overflow-hidden rounded-[36px] border border-white/10 bg-[#090909] shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:block">
          <div className="relative h-full min-h-[720px]">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
              alt="Streetwear visual"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/85" />
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <p className="mb-4 font-['Oswald'] text-sm uppercase tracking-[0.55em] text-red-500">
                Stay Dark. Dress Bold.
              </p>
              <h1
                className="max-w-xl text-6xl leading-[0.9] text-white"
                style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}
              >
                ACCESS THE
                <span className="block text-red-600">ROCKWEAR CLUB</span>
              </h1>
              <p className="mt-5 max-w-lg font-poppins text-base leading-7 text-white/70">
                Log in to continue your order flow, manage favorites, and keep
                track of every new collection drop.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-xl items-center">
          <div className="w-full rounded-[32px] border border-white/10 bg-[#0b0b0b]/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
