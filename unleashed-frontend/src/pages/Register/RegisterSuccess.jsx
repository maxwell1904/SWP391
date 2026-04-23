import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import RegSuccessAnim from "../../assets/anim/RegisterSuccess.json";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { jwtDecode } from "jwt-decode";
import { toast, Zoom } from "react-toastify";

const RegisterSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const signIn = useSignIn();
    const [isAutoSigningIn, setIsAutoSigningIn] = useState(true);

    useEffect(() => {
        const token = searchParams.get("token");

        localStorage.removeItem("mail");

        if (!token) {
            setIsAutoSigningIn(false);
            return;
        }

        try {
            const user = jwtDecode(token);

            const signedIn = signIn({
                auth: {
                    token,
                    type: "Bearer",
                },
                userState: {
                    username: user.sub,
                    userImage: user.image,
                    role: user.role?.[0]?.authority,
                    userEmail: user.userEmail,
                },
            });

            if (!signedIn) {
                throw new Error("Sign-in failed");
            }

            toast.success("Your email has been verified successfully.", {
                position: "top-center",
                transition: Zoom,
            });

            navigate("/", { replace: true });
        } catch (error) {
            setIsAutoSigningIn(false);
            toast.error("Email verification succeeded, but automatic sign-in failed.", {
                position: "top-center",
                transition: Zoom,
            });
        }
    }, [navigate, searchParams, signIn]);

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
                    {isAutoSigningIn
                        ? "Your email has been confirmed. We are signing you in now."
                        : "Your email has been confirmed successfully. You can continue to the home page."}
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
