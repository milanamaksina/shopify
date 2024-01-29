import { FC, useEffect, useState } from "react";
import "./ProductsInfo.scss";
import axios from "axios";
import { Product } from "../../models/product";
import Card from "../../components/Card";

export const ContactInformation: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3009/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="main-card">
      <h1>Shopify Products</h1>
      <div className="product-cards-container">
        {products?.length > 0 &&
          products.map((product) => <Card product={product} />)}
      </div>
    </div>
  );
};

export default ContactInformation;
