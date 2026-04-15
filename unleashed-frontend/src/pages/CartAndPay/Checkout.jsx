import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Badge, Box, Button, Divider, InputAdornment, List, ListItem, ListItemIcon, ListItemText, TextField,
    Typography, Modal, Paper, CircularProgress, IconButton,
} from "@mui/material";
import { useCart } from "react-use-cart";
import { useNavigate } from "react-router-dom";
import LocationSelector from "../../service/LocationService";
import { formatPrice } from "../../components/format/formats";
import ShipmentSelector from "../../service/ShipmentService";
import { CommonRadioCard } from "../../components/inputs/Radio";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { checkDiscount, checkoutOrder, checkStock, getPaymentMethod, getShippingMethod, getBestDiscounts } from "../../service/CheckoutService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast } from "react-toastify";
import { fetchMembership, GetUserInfo } from "../../service/UserService";
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const style = {
    py: 0,
    width: "100%",
    maxWidth: "auto",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
};

const CheckoutPage = () => {
    const [location, setLocation] = useState({ tinh: "", quan: "", phuong: "" });
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState();
    const [shippingMethods, setShippingMethods] = useState([]);
    const [shippingMethod, setShippingMethod] = useState();
    const { items, isEmpty, cartTotal } = useCart();
    const [discountApply, setDiscountApply] = useState({ discountType: "", discountValue: 0, maximumDiscountValue: 0 });
    const [userData, setUserData] = useState({});
    const [note, setNote] = useState("");
    const navigate = useNavigate();
    const [discountCode, setDiscountCode] = useState("");
    const [discountMinus, setDiscountMinus] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const userState = useAuthUser();
    const authHeader = useAuthHeader();
    const [isCheckoutReady, setIsCheckoutReady] = useState(false);
    const [houseNumber, setHouseNumber] = useState("");
    const [rank, setRank] = useState();
    const [rankDiscount, setRankDiscount] = useState(0);

    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [suggestedDiscounts, setSuggestedDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);

    const calculateFinalCheckoutPrice = useCallback(() => {
        const shippingCost = shippingMethod ? (shippingMethod.id === 1 ? 20000 : 10000) : 0;
        const totalBeforeDiscount = cartTotal + shippingCost;
        const totalAfterDiscount = totalBeforeDiscount - discountMinus - rankDiscount;
        return Math.max(0, totalAfterDiscount);
    }, [cartTotal, shippingMethod, discountMinus, rankDiscount]);

    useEffect(() => {
        if (isEmpty) {
            navigate(-1);
        }
    }, [isEmpty, navigate]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!authHeader) return;
            try {
                const [methodsResponse, userInfoResponse] = await Promise.all([
                    Promise.all([getPaymentMethod(authHeader), getShippingMethod(authHeader)]),
                    GetUserInfo(authHeader)
                ]);
                const [paymentRes, shippingRes] = methodsResponse;
                const userInfo = userInfoResponse.data;
                const availablePaymentMethods = paymentRes.data || [];
                setPaymentMethods(availablePaymentMethods);
                setShippingMethods(shippingRes.data || []);
                setUserData({
                    userId: userInfo.userId || "",
                    email: userInfo.userEmail || "",
                    username: userInfo.username || "",
                    fullName: userInfo.fullname || "",
                    userAddress: userInfo.userAddress === "Address not provided" ? "" : userInfo.userAddress,
                    currentPaymentMethod: userInfo.userCurrentPaymentMethod || null,
                });
                const fullAddress = userInfo.userAddress;
                if (fullAddress && fullAddress !== "Address not provided") {
                    const addressParts = fullAddress.split(',').map(part => part.trim());
                    if (addressParts.length >= 4) {
                        const houseAndStreet = addressParts.slice(0, addressParts.length - 3).join(', ');
                        setHouseNumber(houseAndStreet);
                    } else {
                        setHouseNumber(fullAddress);
                    }
                }
                const savedMethodName = userInfo.userCurrentPaymentMethod;
                if (savedMethodName && availablePaymentMethods.length > 0) {
                    const defaultMethod = availablePaymentMethods.find((pm) => pm.paymentMethodName === savedMethodName);
                    if (defaultMethod) setPaymentMethod(defaultMethod);
                }
            } catch (e) {
                toast.error("Failed to load checkout information. Please refresh the page.", { position: "top-center", autoClose: 2000 });
            }
        };
        fetchInitialData();
    }, [authHeader, navigate]);

    useEffect(() => {
        const fetchRank = async () => {
            if (userState?.username && authHeader) {
                const response = await fetchMembership(authHeader, userState.username);
                if (response.data.rankStatus === 1) {
                    setRank(response.data.rank);
                }
            }
        };
        fetchRank();
    }, [authHeader, userState]);

    useEffect(() => {
        if (rank) {
            setRankDiscount(cartTotal * (rank.rankBaseDiscount || 0));
        } else {
            setRankDiscount(0);
        }
    }, [cartTotal, rank]);

    useEffect(() => {
        const fetchSuggestedDiscounts = async () => {
            if (cartTotal > 0 && authHeader) {
                setLoadingDiscounts(true);
                try {
                    const response = await getBestDiscounts(authHeader, cartTotal);
                    setSuggestedDiscounts(response.data || []);
                } catch (error) {
                    console.error("Failed to fetch suggested discounts:", error);
                } finally {
                    setLoadingDiscounts(false);
                }
            }
        };
        fetchSuggestedDiscounts();
    }, [cartTotal, authHeader]);

    useEffect(() => {
        setFinalTotal(calculateFinalCheckoutPrice());
    }, [calculateFinalCheckoutPrice]);

    const handleFeeCalculated = useCallback((fee) => {
        setShippingFee(fee);
    }, []);

    const handleHouseNumberBlur = (e) => {
        setHouseNumber(e.target.value);
    };

    const handleNoteBlur = (e) => {
        setNote(e.target.value);
    };

    const handleLocationChange = useCallback((newLocation) => {
        setLocation(newLocation);
    }, []);

    const handlePaymentMethodChange = useCallback((e) => {
        const selectedPayment = paymentMethods.find(p => p.id === parseInt(e.target.value, 10));
        setPaymentMethod(selectedPayment);
    }, [paymentMethods]);

    const handleShippingMethodChange = useCallback((e) => {
        const selectedShipping = shippingMethods.find(s => s.id === parseInt(e.target.value, 10));
        setShippingMethod(selectedShipping);
    }, [shippingMethods]);

    const handleDiscountCheck = async (code) => {
        const codeToApply = code || discountCode;
        if (!codeToApply) return;
        try {
            const response = await checkDiscount(codeToApply, authHeader, cartTotal);
            if (response?.data) {
                const discount = response.data;
                setDiscountCode(codeToApply);
                setDiscountApply(discount);
                setDiscountMinus(calculateDiscount(cartTotal, discount));
                toast.success("Discount applied successfully!", { position: "top-center", autoClose: 2000 });
            } else {
                setDiscountApply({ discountType: "", value: 0 });
                setDiscountMinus(0);
                setDiscountCode("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid discount code.", { position: "top-center", autoClose: 2000 });
            setDiscountApply({ discountType: "", value: 0 });
            setDiscountMinus(0);
            setDiscountCode("");
        }
    };

    const handleSelectDiscount = (selectedCode) => {
        setIsDiscountModalOpen(false);
        handleDiscountCheck(selectedCode);
    };

    const calculateDiscount = (originalPrice, discount) => {
        if (!discount || !discount.discountType) return 0;
        if (discount.discountType.id === 1) {
            const calculatedDiscount = (originalPrice * discount.discountValue) / 100;
            return Math.min(calculatedDiscount, discount.maximumDiscountValue || Infinity);
        }
        if (discount.discountType.id === 2) {
            return discount.discountValue;
        }
        return 0;
    };

    const itemCheckout = items.map((item) => ({
        id: item.id,
        image: item.image,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
    }));

    const fullAddress = useMemo(() => {
        if (location.tinh && location.quan && location.phuong && houseNumber.trim()) {
            return `${houseNumber.trim()}, ${location.phuong}, ${location.quan}, ${location.tinh}`;
        }
        return "";
    }, [houseNumber, location]);

    const checkoutData = useMemo(() => {
        const updatedOrderDetails = items.map((item) => ({
            variationId: item.id,
            orderQuantity: item.quantity,
            unitPrice: item.price,
            discountAmount: (item.price / cartTotal) * discountMinus,
        }));
        return {
            notes: note,
            discountCode: discountCode || null,
            totalAmount: finalTotal,
            shippingFee: shippingFee + (shippingMethod ? (shippingMethod.id === 1 ? 20000 : 10000) : 0),
            orderDetails: updatedOrderDetails,
            userAddress: fullAddress,
            paymentMethod: paymentMethod,
            shippingMethod: shippingMethod
        };
    }, [items, cartTotal, discountMinus, note, discountCode, finalTotal, shippingFee, shippingMethod, fullAddress, paymentMethod]);

    useEffect(() => {
        const isComplete = !!(
            checkoutData.totalAmount > 0 &&
            checkoutData.shippingFee > 0 &&
            checkoutData.orderDetails.length > 0 &&
            checkoutData.paymentMethod &&
            checkoutData.shippingMethod &&
            checkoutData.userAddress
        );
        setIsCheckoutReady(isComplete);
    }, [checkoutData]);

    const handlePlaceOrder = async () => {
        if (!isCheckoutReady) {
            toast.warn("Please complete all required fields.", { position: "top-center", autoClose: 2000 });
            return;
        }
        try {
            await checkStock(checkoutData, authHeader);
            const response = await checkoutOrder(checkoutData, authHeader);
            if (response?.data) {
                localStorage.setItem("orderId", response.data.orderId);
                if (response.data.redirectUrl) {
                    window.location.href = response.data.redirectUrl;
                } else if (paymentMethod.paymentMethodName === "TRANSFER") {
                    navigate("/orders/bankTransfer?total=" + checkoutData.totalAmount);
                } else {
                    navigate("/orders/success");
                }
            }
        } catch (error) {
            console.error("Order placement failed:", error);
            if (error.response?.status !== 400) {
                toast.error("Failed to place order. Please try again.", { position: "top-center", autoClose: 2000 });
            }
        }
    };

    const handlePaymentMethodName = (name) => {
        if (name === "COD") return "Cash on Delivery";
        if (name === "VNPAY") return "Payment via VNPay";
        if (name === "TRANSFER") return "Bank Transfer";
        return "";
    };

    const handlePaymentMethodDes = (name) => {
        if (name === "COD") return "Pay in cash when your order is delivered.";
        if (name === "VNPAY") return "Pay via QR code using the VNPay app.";
        if (name === "TRANSFER") return "Transfer the total amount to our bank account.";
        return "";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-items-start">
            <div className="checkoutInfomation w-full">
                <div className="bgCartItem bg-gray-100 md:px-9">
                    <div className="checkoutHeader md:p-10 flex justify-start items-center font-poppins">
                        <p className="font-semibold text-2xl">Your Order</p>
                    </div>
                    <List sx={style}>
                        {itemCheckout.map((item) => (
                            <React.Fragment key={item.id}>
                                <ListItem>
                                    <ListItemIcon>
                                        <Badge badgeContent={item.quantity} color="primary">
                                            <img src={item.image} alt={item.name} className="max-w-24 max-h-24 rounded-lg" />
                                        </Badge>
                                    </ListItemIcon>
                                    <ListItemText sx={{ px: "10px" }}>
                                        <p className="font-poppins font-semibold text-lg md:text-xl">{item.name}</p>
                                        <span>Size: </span><span className="font-semibold">{item.size}</span>
                                        <span className="px-2">|</span>
                                        <span>Color: </span><span className="font-semibold">{item.color}</span>
                                    </ListItemText>
                                    <ListItemText sx={{ textAlign: 'right' }}>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </ListItemText>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                    <p className="font-poppins font-semibold text-xl py-5">Discount Code</p>
                    <TextField
                        variant="outlined"
                        fullWidth
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={!!discountApply.discountType}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button onClick={() => handleDiscountCheck()} disabled={!!discountApply.discountType}>
                                        {discountApply.discountType ? "Applied" : "Apply"}
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="text"
                        onClick={() => setIsDiscountModalOpen(true)}
                        sx={{ mt: 1 }}
                        disabled={loadingDiscounts || suggestedDiscounts.length === 0}
                    >
                        {loadingDiscounts ? "Finding Vouchers..." : "Choose Available Voucher"}
                    </Button>
                    <Divider sx={{ py: '15px' }} />
                    <Box sx={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: 1, p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>Order Summary</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Subtotal</Typography>
                            <Typography fontWeight="600">{formatPrice(cartTotal)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <ShipmentSelector provinceName={location.tinh} onFeeCalculated={handleFeeCalculated} />
                            <Typography color="text.secondary">Shipping Cost</Typography>
                            <Typography fontWeight="600">{formatPrice(shippingMethod ? (shippingMethod.id === 1 ? 20000 : 10000) : 0)}</Typography>
                        </Box>
                        {rank && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Membership ({rank.rankName})</Typography>
                                <Typography fontWeight="600" color="success.main">- {formatPrice(rankDiscount)}</Typography>
                            </Box>
                        )}
                        {discountMinus > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Coupon Discount</Typography>
                                <Typography fontWeight="600" color="success.main">- {formatPrice(discountMinus)}</Typography>
                            </Box>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="600">Total</Typography>
                            <Typography variant="h5" fontWeight="bold" color="error.main">{formatPrice(finalTotal)}</Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ py: '15px' }} />
                </div>
            </div>
            <div className="cartTotal w-full px-10">
                <div className="infomationHeader font-poppins text-2xl text-center font-bold">
                    <h1>Your Information</h1>
                </div>
                <div className="userInfomation">
                    <p className="font-poppins font-semibold text-2xl pt-3">Email</p>
                    <TextField variant="outlined" fullWidth value={userData.email || ""} disabled />
                </div>
                <div className="BillingAddress font-poppins space-y-5">
                    <p className="font-semibold text-2xl pt-3">Billing Address</p>
                    <LocationSelector onLocationChange={handleLocationChange} initialAddress={userData.userAddress} />
                    <TextField
                        variant="outlined"
                        fullWidth
                        placeholder="House number, street name"
                        value={houseNumber}
                        onBlur={handleHouseNumberBlur}
                        onChange={(e) => setHouseNumber(e.target.value)}
                    />
                </div>
                <div className="Payment pt-3 space-y-3">
                    <p className="font-poppins font-semibold text-2xl">Payment</p>
                    {paymentMethods.map(payment =>
                        <CommonRadioCard
                            key={payment.id}
                            value={payment.id}
                            label={handlePaymentMethodName(payment.paymentMethodName)}
                            checked={paymentMethod?.id === payment.id}
                            onChange={handlePaymentMethodChange}
                            description={handlePaymentMethodDes(payment.paymentMethodName)}
                        />
                    )}
                    <p className="font-poppins font-semibold text-2xl">Shipping</p>
                    {shippingMethods.map(shipping =>
                        <CommonRadioCard
                            key={shipping.id}
                            value={shipping.id}
                            label={shipping.shippingMethodName}
                            checked={shippingMethod?.id === shipping.id}
                            onChange={handleShippingMethodChange}
                        />
                    )}
                </div>
                <div className="note py-5">
                    <p className="font-poppins font-semibold text-2xl pt-3">Note</p>
                    <TextField variant="outlined" fullWidth placeholder="Any special requests?" onBlur={handleNoteBlur} multiline />
                </div>
                <div className="btnCheckout flex justify-end pb-3">
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={!isCheckoutReady}
                        variant="contained"
                        size="large"
                        sx={{
                            backgroundColor: isCheckoutReady ? 'black' : 'grey.400',
                            color: 'white',
                            borderRadius: "10px",
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: isCheckoutReady ? 'grey.800' : 'grey.400',
                            }
                        }}
                    >
                        {isCheckoutReady ? `Pay ${formatPrice(finalTotal)}` : "Please complete information"}
                    </Button>
                </div>
            </div>
            <Modal
                open={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
            >
                <Paper sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2">Select a Voucher</Typography>
                        <IconButton onClick={() => setIsDiscountModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Divider />
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {loadingDiscounts ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box> :
                            suggestedDiscounts.length > 0 ? (
                                suggestedDiscounts.map(d => (
                                    <ListItem
                                        key={d.discountId}
                                        secondaryAction={
                                            <Button edge="end" onClick={() => handleSelectDiscount(d.discountCode)}>
                                                Apply
                                            </Button>
                                        }
                                        sx={{ my: 1, border: '1px solid #ddd', borderRadius: 1 }}
                                    >
                                        <ListItemText
                                            primary={d.discountTypeName === 'PERCENTAGE' ? `${d.discountValue}% OFF` : `${formatPrice(d.discountValue)} OFF`}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {`Code: ${d.discountCode}`}
                                                    </Typography>
                                                    {` — Min. spend ${formatPrice(d.minimumOrderValue)}`}
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No applicable vouchers found.</Typography>
                            )
                        }
                    </List>
                </Paper>
            </Modal>
        </div>
    );
};
export default CheckoutPage;