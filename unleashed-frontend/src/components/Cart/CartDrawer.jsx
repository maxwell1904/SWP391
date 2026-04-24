import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCart } from "react-use-cart";
import {
    Drawer,
    List,
    ListItem,
    Button,
    Typography,
    Box,
    Divider,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Drawerbtn } from "../buttons/Button";
import { formatPrice } from "../format/formats";
import { MdAdd, MdCancel, MdRemove } from "react-icons/md";
import { addToCart, fetchUserCart, removeAllFromCart, removeFromCart } from "../../service/UserService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast } from "react-toastify";

const CartDrawer = ({ isCartOpen, toggleCartDrawer }) => {
    const [isLoading, setIsLoading] = useState(false);
    const drawerRef = useRef(null);
    const isCartFetched = useRef(false);

    const {
        isEmpty,
        items,
        removeItem,
        emptyCart,
        cartTotal,
        updateItemQuantity,
        setItems,
    } = useCart();

    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    // THIS IS THE PRIMARY FIX:
    // The dependency array for useCallback has been corrected. We only need `authHeader`.
    // The setter functions (setItems, emptyCart) are stable enough to be excluded,
    // which prevents the infinite loop.
    const fetchCart = useCallback(async () => {
        if (!authHeader || isCartFetched.current) {
            return;
        }

        isCartFetched.current = true;
        setIsLoading(true);

        try {
            const response = await fetchUserCart(authHeader);
            const cartData = response?.data;

            if (cartData && Object.keys(cartData).length > 0) {
                const newCartItems = [];
                for (const [productName, variations] of Object.entries(cartData)) {
                    for (const data of variations) {
                        const variation = data.variation;
                        if (!variation) continue;

                        let finalPrice = variation.variationPrice;
                        if (data.promotion && data.promotion.promotionValue != null) {
                            if (data.promotion.promotionType?.promotionTypeName === 'PERCENTAGE') {
                                finalPrice = variation.variationPrice - (variation.variationPrice * data.promotion.promotionValue / 100);
                            } else if (data.promotion.promotionType?.promotionTypeName === 'FIXED AMOUNT') {
                                finalPrice = variation.variationPrice - data.promotion.promotionValue;
                            }
                        }

                        newCartItems.push({
                            id: variation.id,
                            name: productName,
                            color: variation.colorName,
                            size: variation.sizeName,
                            image: variation.variationImage,
                            price: finalPrice,
                            maxQuantity: data.stockQuantity,
                            quantity: data.quantity,
                        });
                    }
                }
                setItems(newCartItems);
            } else {
                emptyCart();
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            emptyCart();
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authHeader]); // The dependency array is now stable.

    // This useEffect now works correctly because `fetchCart` is stable.
    useEffect(() => {
        if (isCartOpen) {
            fetchCart();
        } else {
            isCartFetched.current = false;
        }
    }, [isCartOpen, fetchCart]);


    const handleClickOutside = (event) => {
        if (drawerRef.current && !drawerRef.current.contains(event.target)) {
            toggleCartDrawer(false)();
        }
    };

    useEffect(() => {
        if (isCartOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCartOpen, toggleCartDrawer]);

    const handleUpdateQuantity = async (item, amount) => {
        const newQuantity = item.quantity + amount;
        if (newQuantity < 1 || newQuantity > item.maxQuantity) return;
        await addToCart(authHeader, item.id, amount);
        updateItemQuantity(item.id, newQuantity);
    };

    const handleRemovefromCart = async (item) => {
        try {
            await removeFromCart(authHeader, item.id);
            removeItem(item.id);
            toast.success("Item removed from cart", { position: "top-center", autoClose: 2000 });
        } catch (error) {
            toast.error("Failed to remove item. Please try again.", { position: "top-center" });
        }
    };

    const handleClearAll = async () => {
        if (isEmpty) return;
        try {
            await removeAllFromCart(authHeader);
            emptyCart();
            toast.success("Cart has been cleared", { position: "top-center", autoClose: 2000 });
        } catch (error) {
            toast.error("Failed to clear cart. Please try again.", { position: "top-center" });
        }
    };

    const handleClickCheckout = () => {
        toggleCartDrawer(false)();
        navigate("/checkout");
    };

    return (
        <Drawer
            anchor="right"
            open={isCartOpen}
            onClose={() => toggleCartDrawer(false)}
            PaperProps={{
                sx: { width: "25%", minWidth: '350px', padding: "15px" },
            }}
        >
            <div ref={drawerRef} className="p-4">
                <Typography variant="h5" className="font-bold" gutterBottom fontFamily="Poppins">
                    Shopping Cart
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isEmpty ? (
                    <Typography variant="body1" fontFamily="Poppins" textAlign="center" my={4}>
                        Your cart is empty.
                    </Typography>
                ) : (
                    <List>
                        {items.map((item) => (
                            <ListItem key={item.id} sx={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
                                <img src={item.image} alt={item.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", marginRight: "15px" }} />
                                <Box flexGrow={1}>
                                    <Typography variant="body1" color="text.primary" fontFamily="Poppins" sx={{wordBreak: 'break-word'}}>{item.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontFamily="Poppins">{item.color} - {item.size}</Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <IconButton onClick={() => handleUpdateQuantity(item, -1)} size="small" disabled={item.quantity <= 1}><MdRemove /></IconButton>
                                        <Typography variant="body2" mx={1}>{item.quantity}</Typography>
                                        <IconButton onClick={() => handleUpdateQuantity(item, 1)} size="small" disabled={item.quantity >= item.maxQuantity}><MdAdd /></IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" fontFamily="Poppins">
                                        {item.quantity} x&nbsp;
                                        <strong>{formatPrice(item.price)}</strong>
                                    </Typography>
                                </Box>
                                <IconButton onClick={() => handleRemovefromCart(item)} size="small" color="secondary" sx={{ alignSelf: 'flex-start' }}>
                                    <MdCancel />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                )}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" color="text.primary" fontWeight="bold" fontFamily="Poppins">Subtotal</Typography>
                    <Typography variant="body1" color="primary" fontWeight="bold" fontFamily="Poppins">{formatPrice(cartTotal)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" marginTop="16px" sx={{ gap: "16px" }}>
                    <Drawerbtn context={"Clear All"} handleClick={handleClearAll} isEmpty={isEmpty} />
                    <Drawerbtn context={"Checkout"} handleClick={handleClickCheckout} isEmpty={isEmpty} />
                </Box>
            </div>
        </Drawer>
    );
};

export default CartDrawer;