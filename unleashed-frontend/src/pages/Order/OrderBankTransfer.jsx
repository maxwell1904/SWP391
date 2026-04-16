import React, { useEffect, useState } from "react";
import qrvcb from "../../assets/images/bankTransferVCB.jpg";
import qrzp from "../../assets/images/bankTransferZP.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { formatPrice } from "../../components/format/formats";
import { Navbar } from "../../components/navbars/Navbar";
import Footer from "../../components/footer/CustomerFooter";

function OrderBankTransfer() {
    const OrderId = localStorage.getItem("orderId");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const navigate = useNavigate();
    const { emptyCart } = useCart();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const total = queryParams.get("total");
    const customQrSrc = "/download.png";

    const handleNavigate = () => {
        navigate("/orders/success");
    };

    useEffect(() => {
        if (!OrderId) {
            emptyCart();
            return navigate("/shop");
        }
    }, [OrderId, emptyCart, navigate]);

    const handleConfirmPayment = () => {
        setIsConfirmed(true);
    };

    const setViewport = () => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        } else {
            const newViewportMeta = document.createElement('meta');
            newViewportMeta.name = 'viewport';
            newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.getElementsByTagName('head')[0].appendChild(newViewportMeta);
        }
    };

    useEffect(() => {
        setViewport();
    }, []);


    return (
        <>
            {/*<Navbar />*/}
            <div className="flex items-center justify-center min-h-screen pt-32 pb-16">
                <div className="mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
                        {/* Left side: QR Codes */}
                        <div className="flex flex-col md:flex-row justify-center items-center">
                            <div className="relative w-full md:w-1/2">
                                <img
                                    src={qrvcb}
                                    alt="QR Code for VCB Payment"
                                    className="w-full h-auto object-contain"
                                />
                                <img
                                    src={customQrSrc}
                                    alt="Custom QR for VCB Payment"
                                    className="absolute object-contain pointer-events-none"
                                    style={{ left: "25.4%", top: "24.3%", width: "48.5%" }}
                                />
                            </div>
                            <div className="relative w-full md:w-1/2">
                                <img
                                    src={qrzp}
                                    alt="QR Code for ZaloPay Payment"
                                    className="w-full h-auto object-contain"
                                />
                                <img
                                    src={customQrSrc}
                                    alt="Custom QR for ZaloPay Payment"
                                    className="absolute object-contain pointer-events-none"
                                    style={{ left: "19.8%", top: "36.6%", width: "60.3%" }}
                                />
                            </div>
                        </div>

                        {/* Right side: Order Information */}
                        <div className="flex flex-col justify-center items-center space-y-4 font-montserrat">
                            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                                <p className="text-center text-gray-600">
                                    Please complete your payment by scanning the QR code above. After
                                    the payment is successful, we will process your order.
                                </p>
                                <p className="text-center text-gray-600">
                                    Ensure that the amount is transferred correctly to avoid delays.
                                </p>
                                <p className="text-center text-gray-600 font-bold">
                                    Content: "ORDER {`{OrderId}`}"
                                </p>
                                <p className="text-center text-gray-600 font-bold">
                                    Total: {formatPrice(total)}
                                </p>
                                <p className="text-center text-gray-600">Owner: Nguyễn Phúc An</p>
                                <div className="space-y-4 mt-4">
                                    {!isConfirmed ? (
                                        <>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={handleConfirmPayment}
                                                    className="mt-4 px-6 py-2 bg-beluBlue text-white rounded-full hover:bg-blue-700 font-poppins transition-transform duration-300 hover:scale-105"
                                                >
                                                    Confirm Transfer
                                                </button>
                                            </div>
                                            <p className="text-red-500 text-sm text-center">
                                                After confirming, you will not be able to go back to this
                                                step.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p>Your payment has been confirmed. Thank you!</p>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={handleNavigate}
                                                    className="mt-4 px-6 py-2 bg-beluBlue text-white rounded-full hover:bg-blue-700 font-poppins transition-transform duration-300 hover:scale-105"
                                                >
                                                    Confirm Order
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderBankTransfer;
