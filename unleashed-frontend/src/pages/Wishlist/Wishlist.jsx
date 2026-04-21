import {
  Backdrop,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { jwtDecode } from "jwt-decode";
import { getWishlist, removeFromWishlist } from "../../service/WishlistService";
import { toast } from "react-toastify";

const PAGE_SIZE = 6;

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [username, setUsername] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
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

  const fetchWishlist = useCallback(
    async (page) => {
      if (!username) {
        setWishlist([]);
        setTotalPages(1);
        setCurrentPage(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getWishlist(username, page, PAGE_SIZE);
        const pageItems = data?.wishlist || [];
        const pageCount = data?.totalPages ?? 0;
        const serverPage = data?.currentPage ?? 0;

        if (pageCount > 0 && serverPage >= pageCount) {
          setCurrentPage(pageCount - 1);
          return;
        }

        setWishlist(pageItems);
        setTotalPages(pageCount > 0 ? pageCount : 1);
        setCurrentPage(serverPage);
      } finally {
        setLoading(false);
      }
    },
    [username],
  );

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    if (username) {
      const success = await removeFromWishlist(username, productId);
      if (success) {
        toast.success("Removed from wishlist!");
        if (wishlist.length === 1 && currentPage > 0) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchWishlist(currentPage);
        }
      } else {
        toast.error("Failed to remove item.");
      }
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page - 1);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Wishlist
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 220,
          }}
        >
          <Backdrop
            sx={(theme) => ({
              color: "#fff",
              zIndex: theme.zIndex.drawer + 1,
            })}
            open={true}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : wishlist.length === 0 ? (
        <Typography variant="h6">Your wishlist is empty.</Typography>
      ) : (
        <>
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
                              cursor: "pointer",
                              transition: "transform 0.1s ease-in-out",
                              "&:hover": {
                                transform: "scale(1.2)",
                              },
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
                            cursor: "not-allowed",
                            opacity: 0.6,
                            transition: "transform 0.1s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                            },
                          }}
                          onClick={() =>
                            toast.warning(
                              "This product currently is not available!",
                            )
                          }
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

          <Box className="pagination-controls max-w-[800px] flex justify-center py-4">
            <Pagination
              count={totalPages}
              page={currentPage + 1}
              onChange={handlePageChange}
              shape="rounded"
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default WishlistPage;
