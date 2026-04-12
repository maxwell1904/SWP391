import React, { useEffect } from "react";
import Lottie from "lottie-react";
import MailVer from "../../assets/anim/Mailverification.json";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export function ConfirmRegister() {
    const email = localStorage.getItem("mail");
    const navigate = useNavigate();

    const handleResendEmail = () => {
        // Logic to resend verification email
       // console.log("Resend email logic goes here");
    };

    const handleReturnToSite = () => {
        navigate("/"); // Redirect to home page or any other page
    };

    return (
        <div className="RegisterConfirm flex flex-col items-center py-24">
            <div className="MailSended w-44">
                <Lottie animationData={MailVer} loop={false} />
            </div>
            <div className="contextMail font-inter text-center space-y-10 py-10">
                <h1 className="text-5xl">Verify your email address</h1>
                <p>We have sent a verification link to {email}.</p>
                <p>Please confirm to complete the verification process.
                    Once it’s done you will be able to start shopping!</p>
            </div>
            <div className="button flex space-x-5">
                {/* <button className="btn bg-blueOcean rounded-2xl font-inter text-white w-44 h-12" onClick={handleResendEmail}>
                    <p>Resend email</p>
                </button> */}
                <button className="btn Return btn flex bg-transparent items-center space-x-2 font-inter shadow-none border-2 border-gray-300 rounded-full py-2 px-5" onClick={handleReturnToSite}>
                    <p>Return to Site</p><FaArrowRight />
                </button>
            </div>
            <p className="py-20 font-inter text-gray-500">Please confirm your registration, and you will officially become one of our valued customers.</p>
        </div>
    );
}
