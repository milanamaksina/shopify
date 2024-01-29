import "./Card.scss";
import { type FC } from "react";
import { Product } from "../models/product";
import useCanvas from "../hooks/useCanvas";

interface CardProps {
  product: Product;
}

export const Card: FC<CardProps> = ({ product }) => {
  const canvasRef = useCanvas(product.imageSrc);

  return (
    <div className="product-card" key={product.id}>
      <div className="product-card-top">
        <canvas ref={canvasRef} />
      </div>
      <div
        className="product-details"
        dangerouslySetInnerHTML={{
          __html: product.bodyHtml.slice(0, 100) + "...",
        }}
      />
    </div>
  );
};

export default Card;
