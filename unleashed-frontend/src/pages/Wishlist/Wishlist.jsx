import {
  Box,
  Card,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DeleteOutline, FavoriteBorderOutlined } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getWishlist, removeFromWishlist } from "../../service/WishlistService";
import EnhancedPagination from "../../components/pagination/EnhancedPagination";

const PAGE_SIZE = 6;

const listItemSx = (theme) => ({
  p: { xs: 1.5, sm: 2 },
  borderRadius: 1,
  borderColor: alpha(theme.palette.text.primary, 0.12),
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
  "&:hover": {
    borderColor: alpha(theme.palette.primary.main, 0.36),
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    transform: "translateY(-1px)",
  },
});

const emptyStateSx = (theme) => ({
  mt: 4,
  textAlign: "center",
  p: 4,
  borderRadius: 1,
  borderStyle: "dashed",
  borderColor: alpha(theme.palette.text.primary, 0.18),
});

const WishlistSkeleton = () => (
  <Stack spacing={2}>
    {[...Array(4)].map((_, index) => (
      <Paper key={index} variant="outlined" sx={listItemSx}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="rectangular" sx={{ width: 96, height: 112, borderRadius: 1, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: "1.15rem" }} />
            <Skeleton variant="text" width="36%" />
          </Box>
          <Skeleton variant="circular" width={38} height={38} />
        </Box>
      </Paper>
    ))}
  </Stack>
);

const EmptyWishlist = () => (
  <Card variant="outlined" sx={emptyStateSx}>
    <FavoriteBorderOutlined sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      Your wishlist is empty.
    </Typography>
    <Typography color="text.secondary">Products you save will appear here.</Typography>
  </Card>
);

const ProductThumbnail = ({ item }) => {
  const isAvailable = item.productStatus !== null;
  const image = (
    <Box
      component="img"
      src={item.productImage || "/default-product-image.jpg"}
      alt={item.productName}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );

  const sharedSx = {
    width: { xs: "100%", sm: 96 },
    height: { xs: 180, sm: 112 },
    borderRadius: 1,
    overflow: "hidden",
    bgcolor: "grey.100",
    flexShrink: 0,
    border: "1px solid",
    borderColor: "divider",
    opacity: isAvailable ? 1 : 0.62,
  };

  if (isAvailable) {
    return (
      <Box
        component={Link}
        to={`/shop/product/${item.productId}`}
        sx={{
          ...sharedSx,
          transition: "transform 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
          },
        }}
      >
        {image}
      </Box>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => toast.warning("This product currently is not available!")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toast.warning("This product currently is not available!");
        }
      }}
      sx={{
        ...sharedSx,
        cursor: "not-allowed",
      }}
    >
      {image}
    </Box>
  );
};

const WishlistItemCard = ({ item, onRemove }) => {
  const isAvailable = item.productStatus !== null;

  return (
    <Paper variant="outlined" sx={listItemSx}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "center" } }}>
        <ProductThumbnail item={item} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.productName}
          </Typography>
          <Typography variant="caption" color={isAvailable ? "text.secondary" : "error.main"} sx={{ display: "block", mt: 0.75 }}>
            {isAvailable ? "Saved product" : "Unavailable product"}
          </Typography>
        </Box>

        <Tooltip title="Remove from wishlist">
          <IconButton
            aria-label="remove from wishlist"
            onClick={() => onRemove(item.productId)}
            sx={(theme) => ({
              alignSelf: { xs: "flex-end", sm: "center" },
              flexShrink: 0,
              color: "error.main",
              bgcolor: alpha(theme.palette.error.main, 0.08),
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.14),
              },
            })}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

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

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Wishlist
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <WishlistSkeleton />
      ) : wishlist.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <Stack spacing={2}>
            {wishlist.map((item) => (
              <WishlistItemCard
                key={item.productId}
                item={item}
                onRemove={handleRemoveFromWishlist}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <EnhancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage) => setCurrentPage(newPage)}
                isLoading={loading}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default WishlistPage;
