import Lottie from "lottie-react";
import React, { useEffect } from "react";
import orderFail from "../../assets/anim/ordererror.json";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { paymentCallback } from "../../service/CheckoutService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { Navbar } from "../../components/navbars/Navbar";
import Footer from "../../components/footer/CustomerFooter";

function OrderFail() {
    const navigate = useNavigate();
    const orderId = localStorage.getItem("orderId");
    const authHeader = useAuthHeader();
    const status = 0;

    useEffect(() => {
        if (orderId && authHeader) {
            paymentCallback(orderId, authHeader, status);
        }
    }, [orderId, authHeader]);

    const handleReturnToHome = () => {
        navigate("/shop");
    };

    return (
        <>
            {/*<Navbar />*/}
            <div className="OrderConfirm flex min-h-screen flex-col items-center justify-center py-24 pt-48">
                <div className="MailSended w-72">
                    <Lottie animationData={orderFail} loop={false} />
                </div>
                <div className="content font-poppins text-center">
                    <p className="text-3xl font-bold">Your order is canceled</p>
                    <p className="pt-3">
                        Something went wrong with your payment. Please try again!
                    </p>
                </div>
                <div className="button flex pt-20 space-x-6">
                    <button
                        className="btn Return flex bg-blueOcean text-white rounded-full items-center space-x-2 font-inter shadow-none border-none w-auto px-4 justify-center h-12"
                        onClick={handleReturnToHome}
                    >
                        <p>Continue Shopping</p>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderFail;