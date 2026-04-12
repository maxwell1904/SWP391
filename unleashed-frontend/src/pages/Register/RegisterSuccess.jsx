import Lottie from "lottie-react";
import React from "react";
import RegSuccessAnim from "../../assets/anim/RegisterSuccess.json";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterSuccess = () => {
    // Logic remains unchanged
    localStorage.removeItem("mail");
    const navigate = useNavigate();

    const handleReturnToHome = () => {
        navigate("/");
    };

    return (
        <div className="RegisterConfirm flex flex-col items-center py-24 font-poppins">
            <div className="MailSended w-44">
                <Lottie animationData={RegSuccessAnim} loop={false} />
            </div>

            <div className="contextMail text-center space-y-6 py-10">
                <h1 className="text-5xl font-bold">Registration Complete!</h1>
                <p className="text-lg text-gray-700 pt-3">
                    Thank you for joining us. You can now log in to get access.
                </p>
            </div>

            <div className="button flex pt-6">
                <button
                    className="btn Return btn flex bg-transparent items-center space-x-2 font-inter shadow-none border-2 border-gray-300 rounded-full py-2 px-5 transition-colors hover:bg-gray-100"
                    onClick={handleReturnToHome}
                >
                    <p>Return to Site</p>
                    <FaArrowRight />
                </button>
            </div>

            <p className="py-20 font-inter text-center text-gray-500 max-w-md">
                Welcome aboard! We're thrilled to have you as a customer and look forward to serving you.
            </p>
        </div>
    );
};

export default RegisterSuccess;