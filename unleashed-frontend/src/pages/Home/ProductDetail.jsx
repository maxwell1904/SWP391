import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Carousel from 'react-material-ui-carousel';
import { useCart } from 'react-use-cart';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Rating,
    Skeleton,
    Breadcrumbs,
    CircularProgress,
    Button,
    Box,
    Typography
} from '@mui/material';
import { formatPrice } from '../../components/format/formats';
import { getProductItem, getProductRecommendations } from '../../service/ShopService';
import ProductRecommend from '../../components/items/ProductRecommend';
import { addToCart } from '../../service/UserService';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import ReviewItem from '../../components/review/ReviewItem';
import ReviewInputBox from '../../components/review/ReviewInputBox';
import {
    checkWishlist,
    addToWishlist,
    removeFromWishlist,
} from '../../service/WishlistService';
import { toast } from "react-toastify";
import { getProductReviews } from '../../service/ReviewService';
import { getCommentAncestors } from '../../service/CommentService';

const ProductDetailPage = () => {
    const { addItem } = useCart();
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const authHeader = useAuthHeader();
    const authUser = useAuthUser();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsPage, setReviewsPage] = useState(0);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [reviewBoxKey, setReviewBoxKey] = useState(0);
    const [expansionState, setExpansionState] = useState({ targetId: null, path: [] });

    const fetchProductDetails = useCallback(async () => {
        try {
            const data = await getProductItem({ id: productId });
            setProduct(data);
        } catch (error) {
            console.error('Failed to fetch product data:', error);
            toast.error("Could not load product details.");
            navigate('/');
        }
    }, [productId, navigate]);

    const fetchReviews = useCallback(async (pageToFetch) => {
        if (!hasMoreReviews && pageToFetch > 0) return;
        setIsLoadingReviews(true);
        try {
            const data = await getProductReviews(productId, pageToFetch, 5, authHeader);
            setReviews(prev => pageToFetch === 0 ? data.content : [...prev, ...data.content]);
            setHasMoreReviews(!data.last);
            setReviewsPage(pageToFetch);
        } catch (error) {
            console.error("Could not load reviews:", error);
        } finally {
            setIsLoadingReviews(false);
        }
    }, [productId, authHeader]);

    const handleRefreshReviews = useCallback(() => {
        setReviewsPage(0);
        setHasMoreReviews(true);
        fetchReviews(0);
        fetchProductDetails();
        setReviewBoxKey(prevKey => prevKey + 1);
    }, [fetchReviews, fetchProductDetails]);

    useEffect(() => {
        const handleAutoExpand = async () => {
            const params = new URLSearchParams(location.search);
            const replyId = params.get('replyId');
            if (replyId) {
                try {
                    const ancestorIds = await getCommentAncestors(replyId);
                    setExpansionState({ targetId: parseInt(replyId, 10), path: ancestorIds });
                } catch (error) {
                    toast.error("Could not trace the replied comment.");
                }
            }
        };
        handleAutoExpand();
    }, [location.search]);

    useEffect(() => {
        setLoading(true);
        setReviews([]);
        setReviewsPage(0);
        setHasMoreReviews(true);
        setExpansionState({ targetId: null, path: [] });
        const loadInitialData = async () => {
            await fetchProductDetails();
            await fetchReviews(0);
            setLoading(false);
        };
        loadInitialData();
    }, [productId, fetchProductDetails, fetchReviews]);

    const sortedColors = useMemo(() => {
        if (!product?.colors) return [];
        return [...product.colors].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }, [product?.colors]);

    useEffect(() => {
        if (!product || !product.variations) return;

        const hasStockForColor = (colorName) => {
            const variationsForColor = product.variations[colorName];
            return variationsForColor && Object.values(variationsForColor).some(v => v.quantity > 0);
        };

        const hasStockForColorAndSize = (colorName, sizeName) => {
            return (product.variations?.[colorName]?.[sizeName]?.quantity || 0) > 0;
        };

        // Keep current color/size after refresh if that combination is still in stock.
        if (selectedColor && hasStockForColor(selectedColor)) {
            if (selectedSize && hasStockForColorAndSize(selectedColor, selectedSize)) {
                return;
            }
            const variationsForColor = product.variations[selectedColor];
            const firstAvailableSize = product.sizes.find(size => variationsForColor[size.sizeName]?.quantity > 0);
            setSelectedSize(firstAvailableSize?.sizeName || null);
            return;
        }

        const firstAvailableColor = sortedColors.find(color => hasStockForColor(color.colorName));
        if (firstAvailableColor) {
            const colorName = firstAvailableColor.colorName;
            const variationsForColor = product.variations[colorName];
            const firstAvailableSize = product.sizes.find(size => variationsForColor[size.sizeName]?.quantity > 0);
            setSelectedColor(colorName);
            setSelectedSize(firstAvailableSize?.sizeName || null);
            return;
        }

        setSelectedColor(null);
        setSelectedSize(null);
    }, [product, selectedColor, selectedSize, sortedColors]);

    const handleColorSelect = (colorName) => {
        setSelectedColor(colorName);
        const variationsForColor = product.variations[colorName];
        const firstAvailableSize = product.sizes.find(size => variationsForColor[size.sizeName]?.quantity > 0);
        setSelectedSize(firstAvailableSize?.sizeName || null);
    };

    const handleSizeSelect = (sizeName) => {
        setSelectedSize(sizeName);
        const isCurrentColorValid = product.variations[selectedColor]?.[sizeName]?.quantity > 0;
        if (!isCurrentColorValid) {
            const firstAvailableColor = sortedColors.find(color => product.variations[color.colorName]?.[sizeName]?.quantity > 0);
            if (firstAvailableColor) {
                setSelectedColor(firstAvailableColor.colorName);
            }
        }
    };

    const handleLoadMoreReviews = () => fetchReviews(reviewsPage + 1);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (product?.productId) {
                setLoadingRecommendations(true);
                try {
                    const recommendations = await getProductRecommendations(product.productId, authUser?.username || '');
                    setRecommendedProducts(recommendations);
                } catch (error) { console.error('Error fetching recommendations:', error); }
                finally { setLoadingRecommendations(false); }
            }
        };
        fetchRecommendations();
    }, [product?.productId, authUser]);

    const { allImages, imageStartIndex } = useMemo(() => {
        if (!product?.variations) return { allImages: [], imageStartIndex: {} };

        const collectedImages = [];
        const colorStartIndices = {};

        sortedColors.forEach(color => {
            const variationsForColor = product.variations[color.colorName];
            if (!variationsForColor) return;

            const variationList = Object.values(variationsForColor);
            const representativeVariation =
                variationList.find(v => v?.quantity > 0 && v?.images) ||
                variationList.find(v => v?.images);

            if (!representativeVariation) return;

            colorStartIndices[color.colorName] = collectedImages.length;
            collectedImages.push({
                colorName: color.colorName,
                image: representativeVariation.images,
            });
        });

        return { allImages: collectedImages, imageStartIndex: colorStartIndices };
    }, [product, sortedColors]);

    useEffect(() => {
        if (selectedColor && imageStartIndex[selectedColor] !== undefined) {
            setCarouselIndex(imageStartIndex[selectedColor]);
        }
    }, [selectedColor, imageStartIndex]);

    const selectedVariation = product?.variations?.[selectedColor]?.[selectedSize] || null;
    const maxQuantity = selectedVariation?.quantity || 1;

    const finalPrice = useMemo(() => {
        if (!product) return 0;
        const basePrice = selectedVariation ? selectedVariation.price : (product.variations && Object.values(Object.values(product.variations)[0])[0]?.price) || 0;
        if (!product.saleType?.saleTypeName || product.saleValue == null) return basePrice;
        if (product.saleType.saleTypeName === 'PERCENTAGE') return basePrice - (basePrice * product.saleValue) / 100;
        if (product.saleType.saleTypeName === 'FIXED AMOUNT') return basePrice - product.saleValue;
        return basePrice;
    }, [product, selectedVariation]);

    const handleAddToCart = async () => {
        if (!authHeader) {
            toast.warn("Please login to continue.", { position: "top-center", autoClose: 2000 });
            return navigate('/login');
        }
        if (!selectedVariation) {
            toast.warn("Please select a color and size.", { position: "top-center", autoClose: 2000 });
            return;
        }
        if (quantity > maxQuantity) {
            toast.error("Not enough items in stock.", { position: "top-center", autoClose: 2000 });
            return;
        }
        const cartItem = { id: selectedVariation.id, name: product.productName, color: selectedColor, size: selectedSize, image: selectedVariation.images, price: finalPrice };
        try {
            await addToCart(authHeader, selectedVariation.id, quantity);
            addItem(cartItem, quantity);
            toast.success("Added item to cart", { position: "top-center", autoClose: 2000 });
            setQuantity(1);
            await fetchProductDetails();
        } catch (error) {
            const errorMessage = error.response?.data || "Failed to add item to cart";
            toast.error(errorMessage, { position: "top-center", autoClose: 2000 });
            setQuantity(1);
        }
    };

    useEffect(() => {
        const checkProductInWishlist = async () => {
            if (authUser?.name && product?.productId) {
                setIsInWishlist(await checkWishlist(authUser.name, product.productId) || false);
            } else { setIsInWishlist(false); }
        };
        checkProductInWishlist();
    }, [authUser, product?.productId]);

    const handleWishlistToggle = async () => {
        if (!authUser?.username) {
            toast.warn("Please login to continue.", { position: "top-center", autoClose: 2000 });
            return navigate('/login');
        }
        try {
            if (isInWishlist) {
                if (await removeFromWishlist(authUser.name, product.productId)) {
                    setIsInWishlist(false);
                    toast.info("Removed from wishlist.", { position: "top-center", autoClose: 2000 });
                }
            } else {
                if (await addToWishlist(authUser.username, product.productId)) {
                    setIsInWishlist(true);
                    toast.success("Added to wishlist!", { position: "top-center", autoClose: 2000 });
                }
            }
        } catch (error) { toast.error("An error occurred with your wishlist.", { position: "top-center", autoClose: 2000 }); }
    };

    if (loading || !product) {
        return (
            <div className='ProductDetail'>
                <div className='headerBreadcums h-32 border-b border-red-600/10 bg-[#050505]'></div>
                <div className='grid grid-cols-5 gap-6 px-20 py-10'>
                    <div className='col-span-3 place-items-center'><Skeleton variant='rectangular' width={600} height={400} /></div>
                    <div className='properties pl-10 col-span-2'>
                        <Skeleton variant='text' width='80%' height={80} /><Skeleton variant='text' width='40%' height={40} />
                        <Skeleton variant='text' width='30%' height={30} /><Skeleton variant='rectangular' width='100%' height={50} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='ProductDetail font-montserrat'>
            <div className='headerBreadcums flex h-32 items-center border-b border-red-600/10 bg-[#050505]'>
                <div className='pl-16'>
                    <Breadcrumbs
                        sx={{
                            fontFamily: 'Poppins',
                            color: '#d1d5db',
                            '& .MuiBreadcrumbs-separator': { color: '#ef4444' },
                            '& a': { color: '#ef4444', textDecoration: 'none' },
                            '& a:hover': { color: '#f87171' }
                        }}
                    >
                        <NavLink to={'/'}>Home</NavLink>
                        <NavLink to={'/shop'}>Shop</NavLink>
                        <p className='text-white/80'>{product.productName}</p>
                    </Breadcrumbs>
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4 sm:px-10 lg:px-20 py-10'>
                <div className='col-span-1 lg:col-span-3 place-items-center'>
                    {allImages.length > 0 ? (
                        <Carousel autoPlay={false} index={carouselIndex} onChange={(index) => setCarouselIndex(index)} sx={{ width: '100%', maxWidth: '800px' }}>
                            {allImages.map((item, index) => (
                                <div key={index} style={{ width: '100%', height: '30rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                                    <img src={item.image} alt={`Product in ${item.colorName}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://placehold.co/600x400' }} />
                                </div>
                            ))}
                        </Carousel>
                    ) : <div className="w-full h-[30rem] flex justify-center items-center bg-gray-100"><p>No images available.</p></div>}
                </div>
                <div className='properties col-span-1 lg:col-span-2 pl-4 lg:pl-10'>
                    <h1 className='mb-4 font-bold text-2xl sm:text-3xl lg:text-5xl'>{product.productName}</h1>
                    <p className='mb-4 text-lg sm:text-xl font-semibold text-blue-700'>{formatPrice(finalPrice)}</p>
                    {product.saleValue > 0 && selectedVariation && <p className='mb-2 text-gray-500 line-through'>{formatPrice(selectedVariation.price)}</p>}
                    <div className='rating mb-4 flex items-center text-gray-500'>
                        <Rating name='half-rating-read' precision={0.5} readOnly value={product.avgRating || 0} />
                        <div className='px-4'>|</div><div className='customerReview text-lg sm:text-xl'>{product.totalRating || 0} Customer Reviews</div>
                    </div>
                    <div className='colors flex items-center mb-4'>
                        <div className='font-semibold text-gray-600'>Color:</div>
                        <div className='px-4 flex gap-2'>
                            {sortedColors.map((color) => {
                                const variations = product.variations?.[color.colorName];
                                const hasAvailableSizes = variations && Object.values(variations).some(v => v.quantity > 0);
                                if (!hasAvailableSizes) return null;
                                return (<div key={color.id} onClick={() => handleColorSelect(color.colorName)}
                                             className={`cursor-pointer w-8 h-8 border border-gray-300 rounded-full ${selectedColor === color.colorName ? 'ring-2 ring-blue-500' : ''}`}
                                             style={{ backgroundColor: color.colorHexCode }} title={color.colorName} />);
                            })}
                        </div>
                    </div>
                    <div className='sizes flex items-center mb-4'>
                        <div className='font-semibold text-gray-600'>Size:</div>
                        <div className='flex gap-2 flex-row px-5'>
                            {product.sizes?.map((size) => {
                                const isAvailableForAnyColor = sortedColors.some(color => product.variations?.[color.colorName]?.[size.sizeName]?.quantity > 0);
                                if (!isAvailableForAnyColor) return null;

                                const isSelected = selectedSize === size.sizeName;
                                const isAvailableForCurrentColor = selectedColor && product.variations?.[selectedColor]?.[size.sizeName]?.quantity > 0;

                                return (
                                    <div key={size.id} onClick={() => handleSizeSelect(size.sizeName)}
                                         className={`px-4 py-2 border rounded-lg transition-colors cursor-pointer
                                            ${isSelected ? 'bg-blue-500 text-white border-blue-500' : isAvailableForCurrentColor ? 'border-gray-300 hover:border-blue-400' : 'border-gray-200 text-gray-400'}`}>
                                        {size.sizeName}
                                    </div>);
                            })}
                        </div>
                    </div>
                    <div className='quantity mb-6'>
                        <div className='font-semibold text-gray-700 mb-2'>Quantity:</div>
                        <div className='flex items-center'>
                            <button className='px-4 py-2 bg-gray-200 text-gray-700 rounded-l-lg' onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input type='number' min={1} max={maxQuantity} value={quantity} onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))} className='w-24 px-4 py-2 text-center border-t border-b border-gray-300' />
                            <button className='px-4 py-2 bg-gray-200 text-gray-700 rounded-r-lg' onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}>+</button>
                            <p className='ml-4 text-sm text-gray-500'>{selectedVariation?.quantity || 0} pieces available</p>
                        </div>
                    </div>
                    <button onClick={handleAddToCart} disabled={!selectedVariation || quantity > maxQuantity || maxQuantity === 0} className={`text-white px-4 py-2 rounded-lg w-full mt-4 transition-colors duration-150 ${!selectedVariation || quantity > maxQuantity || maxQuantity === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}>Add to Cart</button>
                    <button onClick={handleWishlistToggle} className={`text-white px-4 py-2 rounded-lg w-full mt-2 transition-colors duration-150 ${isInWishlist ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</button>
                </div>
            </div>
            <div className='desAndRe px-4 sm:px-10 lg:px-20'>
                <div className='description-section mb-8'><h2 className='text-2xl font-bold mb-4'>Description</h2><div className='content'>{product.description}</div></div>
                <div className='reviews-section mb-8'>
                    <h2 className='text-2xl font-bold mb-4'>Customer Reviews</h2>
                    <Box sx={{ mb: 4 }}><ReviewInputBox key={reviewBoxKey} productId={productId} onReviewPosted={handleRefreshReviews} /></Box>
                    <div className='content px-6 border-2 border-gray-300 rounded-lg p-6'>
                        {reviews && reviews.length > 0 ? (reviews.map((review) => (<ReviewItem key={review.reviewId || review.commentId} review={review} productId={productId} onCommentAction={handleRefreshReviews} expansionPath={expansionState.path} targetId={expansionState.targetId} />))) : (!isLoadingReviews && <Typography>No reviews yet.</Typography>)}
                        {isLoadingReviews && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
                        {hasMoreReviews && !isLoadingReviews && reviews.length > 0 && (<div className="text-center mt-4"><Button onClick={handleLoadMoreReviews} variant="outlined">Load More Reviews</Button></div>)}
                    </div>
                </div>
                <div className='recommended-products mt-10'>
                    <h2 className='text-3xl font-semibold mb-4'>Recommended Products</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1 py-5'>
                        {loadingRecommendations ? <CircularProgress /> : recommendedProducts.map((item) => (<ProductRecommend key={item.productId} product={item} username={authUser?.username} />))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
