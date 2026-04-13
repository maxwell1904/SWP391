import MainLayout from "../../layouts/MainLayout";
import { BuyNow, ShowMore } from "../../components/buttons/Button";
import ProductList from "../../components/lists/ProductList";
import { useNavigate } from "react-router-dom";
// ADDED: Import useEffect and useState for managing local state
import { useEffect, useState } from "react";
// ADDED: Import the service function to fetch data
import { getProductList } from "../../service/ShopService";
// REMOVED: The hook for the obsolete provider is no longer needed
// import { useProduct } from "../../components/Providers/Product";

export function Home() {
    const navigate = useNavigate();

    // ADDED: State to hold the products for this page
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ADDED: useEffect to fetch data when the component loads
    useEffect(() => {
        const fetchLatestProducts = async () => {
            try {
                setLoading(true);
                // Fetch page 1, with a size of 8 products, and no filters.
                // The backend will return the most recently added products by default.
                const data = await getProductList(1, 9, {});
                if (data && data.content) {
                    setLatestProducts(data.content);
                }
            } catch (error) {
                console.error("Failed to fetch latest products for home page:", error);
                // You could set an error state here if you wish
            } finally {
                setLoading(false);
            }
        };

        fetchLatestProducts();
    }, []); // The empty array [] ensures this effect runs only once on mount

    const handleShowMore = () => {
        navigate("/shop");
    };

    // REMOVED: This line is replaced by the state management above
    // const latestProducts = products.slice(-6);

    return (
        <MainLayout>
            <div className="Shop">
                <div className="headerPage relative text-center">
                    <img
                        className="w-screen h-full object-cover"
                        src="https://i.ibb.co/HBMbs6G/homeBg.png"
                        alt="Background"
                    />
                    <div className="containInside w-full md:w-2/3 lg:w-1/3 h-auto md:h-fit bg-white rounded-lg shadow-lg absolute bottom-0 md:bottom-16 right-0 md:right-24 flex flex-col justify-center p-4 md:p-10">
                        <div className="compo text-left">
                            <div className="headerText">
                                <h2 className="font-poppins text-lg md:text-xl">New Arrival</h2>
                            </div>
                            <div className="middleText py-2 md:py-5 sm:py-2">
                                <p className="font-poppins font-bold text-blueOcean lg:text-5xl md:text-3xl sm:text-xl">
                                    Discover Our <br /> New Collection
                                </p>
                            </div>
                            <div className="bottomText py-2 md:py-5 sm:py-2">
                                <p className="text-base md:text-xl">
                                    Your trusted choice for premium style
                                </p>
                            </div>
                            <div className="btnBottom py-2 md:py-5 sm:py-2">
                                <BuyNow />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="product">
                    <div className="ProductContent py-10">
                        <h1 className="text-center font-poppins font-bold text-5xl">
                            Our Products
                        </h1>

                        {/* UPDATED: Pass the products from the new local state */}
                        {loading ? (
                            <p className="text-center">Loading products...</p>
                        ) : (
                            <ProductList products={latestProducts} />
                        )}

                        <div className="showMore flex justify-center py-4">
                            <ShowMore onClick={handleShowMore} />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}