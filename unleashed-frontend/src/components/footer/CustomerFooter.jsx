import React from "react";
import { FaShippingFast } from "react-icons/fa";
import { GoTrophy } from "react-icons/go";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineSupportAgent } from "react-icons/md";
import { Link } from "react-router-dom";
import superlogo from "../../assets/images/superlogo.png";
import { Divider } from "@mui/material";

const Footer = () => {
  return (
    <>
      <div className="grid h-auto grid-cols-1 gap-6 border-y border-white/10 bg-[#080808] px-6 py-10 text-white sm:grid-cols-2 md:grid-cols-4 md:px-10">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-center md:flex-row md:text-left">
          <GoTrophy className="text-5xl text-[#ff4d4d] sm:text-6xl" />
          <div className="mt-4 text-center md:ml-4 md:mt-0 md:text-left">
            <h1 className="font-poppins text-lg font-semibold">High Quality</h1>
            <p className="text-sm text-white/55">
              Streetwear curated with a premium finish.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-center md:flex-row md:text-left">
          <IoShieldCheckmarkOutline className="text-5xl text-[#ff4d4d] sm:text-6xl" />
          <div className="mt-4 text-center md:ml-4 md:mt-0 md:text-left">
            <h1 className="font-poppins text-lg font-semibold">Warranty Protection</h1>
            <p className="text-sm text-white/55">
              Verified orders and secure product support.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-center md:flex-row md:text-left">
          <FaShippingFast className="text-5xl text-[#ff4d4d] sm:text-6xl" />
          <div className="mt-4 text-center md:ml-4 md:mt-0 md:text-left">
            <h1 className="font-poppins text-lg font-semibold">Fast Shipping</h1>
            <p className="text-sm text-white/55">
              Dispatch flow optimized for quick delivery.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-center md:flex-row md:text-left">
          <MdOutlineSupportAgent className="text-5xl text-[#ff4d4d] sm:text-6xl" />
          <div className="mt-4 text-center md:ml-4 md:mt-0 md:text-left">
            <h1 className="font-poppins text-lg font-semibold">24/7 Support</h1>
            <p className="text-sm text-white/55">
              Always-on help for orders, returns, and sizing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid h-auto grid-cols-1 gap-y-10 bg-[#050505] px-6 py-12 text-white sm:grid-cols-2 md:grid-cols-6 md:px-10">
        <div className="col-span-2">
          <p className="font-montserrat text-sm font-medium leading-7 text-white/65 md:text-base">
            600 Nguyen Van Cu Noi Dai, An Binh, Ninh Kieu, Can Tho 900000
            <br />
            FPT CAN THO UNIVERSITY
          </p>
        </div>

        <div className="px-4">
          <p className="py-5 font-poppins text-xl font-medium text-[#ff4d4d] md:text-2xl">
            Links
          </p>
          <div className="flex flex-col space-y-6 font-poppins text-sm font-medium text-white/70 md:text-base">
            <Link className="transition hover:text-white" to="/">
              Home
            </Link>
            <Link className="transition hover:text-white" to="/shop">
              Shop
            </Link>
            <Link className="transition hover:text-white" to="/about">
              About
            </Link>
          </div>
        </div>

        <div className="px-4">
          <p className="py-5 font-poppins text-xl font-medium text-[#ff4d4d] md:text-2xl">
            Help
          </p>
          <div className="flex flex-col space-y-6 font-poppins text-sm font-medium text-white/70 md:text-base">
            <Link className="transition hover:text-white" to="/payment-options">
              Payment Options
            </Link>
            <Link className="transition hover:text-white" to="/return">
              Return
            </Link>
            <Link className="transition hover:text-white" to="/privacy-policies">
              Privacy Policies
            </Link>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-center px-4 md:justify-end">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#1b0505] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <img
              src={superlogo}
              alt="Logo"
              className="h-auto w-full max-w-[300px] object-contain"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#050505] px-6 pb-8 md:px-10">
        <Divider />
        <p className="pt-4 font-poppins text-sm text-white/55 md:text-base">
          2026 &copy; Group 6. All rights reserved
        </p>
      </div>
    </>
  );
};

export default Footer;
