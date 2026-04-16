import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Divider,
    Box
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { jwtDecode } from "jwt-decode";
import { getWishlist, removeFromWishlist } from "../../service/WishlistService";
import { toast } from 'react-toastify';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [username, setUsername] = useState(null);
    const authHeader = useAuthHeader();

    useEffect(() => {
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            try {
                const decodedToken = jwtDecode(token);
                setUsername(decodedToken.sub);
            } catch (error) {
                console.error("Error decoding token:", error);
                setUsername(null);
            }
        } else {
            setUsername(null);
        }
    }, [authHeader]);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (username) {
                const data = await getWishlist(username);
                setWishlist(data || []);
            }
        };
        fetchWishlist();
    }, [username]);

    const handleRemoveFromWishlist = async (productId) => {
        if (username) {
            const success = await removeFromWishlist(username, productId);
            if (success) {
                toast.success("Removed from wishlist!");
                setWishlist(wishlist.filter(item => item.productId !== productId));
            } else {
                toast.error("Failed to remove item.");
            }
        }
    };

    return (
        <Box>
            <Typography variant='h4' fontWeight='bold' gutterBottom>
                Wishlist
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {wishlist.length === 0 ? (
                <Typography variant="h6">Your wishlist is empty.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product Image</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {wishlist.map((item) => (
                                <TableRow key={item.productId}>
                                    <TableCell>
                                        {item.productStatus !== null ? (
                                            <Link to={`/shop/product/${item.productId}`}>
                                                <Box
                                                    component="img"
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    sx={{
                                                        width: 160,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.1s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.2)'
                                                        }
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <Box
                                                component="img"
                                                src={item.productImage}
                                                alt={item.productName}
                                                sx={{
                                                    width: 160,
                                                    cursor: 'not-allowed',
                                                    opacity: 0.6,
                                                    transition: 'transform 0.1s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'scale(1.2)'
                                                    }
                                                }}
                                                onClick={() => toast.warning('This product currently is not available!')}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleRemoveFromWishlist(item.productId)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default WishlistPage;