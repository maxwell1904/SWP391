import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getProductList } from "../../service/ShopService";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProductList();
      if (response && response.length > 0) {
        const filteredProducts = response.filter(
          // CHANGE THIS LINE TO -1 IF YOU WANT TO SHOW ALL PRODUCTS
          (product) => product.quantity > 0
        );
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error! " + error.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  return useContext(ProductContext);
};