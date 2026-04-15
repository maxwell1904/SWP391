import {useNavigate} from "react-router-dom";
import React from "react";
import {IoArrowBack} from "react-icons/io5";
import superlogo from "../../assets/images/superlogo.png";

export function NavLogin() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
        localStorage.removeItem("orderId");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
            <div className="navitem grid min-h-[92px] grid-cols-3 gap-4 content-center px-4 md:px-8">
                <div className="nar-left flex items-center">
                    <button onClick={handleGoBack}><IoArrowBack className="text-3xl text-white/90 transition hover:text-red-400"/></button>
                </div>
                <div className="navinfo items-center justify-center flex space-x-4">
                    <img
                        src={superlogo}
                        alt=""
                        className="logo flex h-20 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] md:h-24"
                    />
                </div>


            </div>
        </nav>
    );
}
