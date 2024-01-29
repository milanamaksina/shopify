import express, { Request, Response } from "express";
import axios from "axios";
import mongoose, { Schema } from "mongoose";
import cors from "cors";

const app = express();
const PORT = 3009;

app.use(cors());

mongoose.connect("mongodb://localhost/shopifyProducts", {
  useUnifiedTopology: true,
} as Parameters<typeof mongoose.connect>[1]);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to db");
});

interface Product {
  id: string;
  bodyHtml: string;
  imageSrc: string;
}

interface ProductDocument extends Document {
  id: string;
  bodyHtml: string;
  imageSrc: string;
}

const productSchema = new Schema<ProductDocument>({
  id: String,
  bodyHtml: String,
  imageSrc: String,
});

const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);

const getShopifyProducts = async (): Promise<Product[]> => {
  console.log("test");
  const accessToken = "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";
  const shopifyGraphQLUrl =
    "https://cpb-new-developer.myshopify.com/admin/api/2023-10/graphql.json";

  const query = `
        {
            products(first: 10) {
                edges {
                    node {
                        id
                        bodyHtml
                        images(first: 1) {
                            nodes {
                                src
                            }
                        }
                    }
                }
            }
        }
    `;

  try {
    const response = await axios.post(
      shopifyGraphQLUrl,
      { query },
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );
    console.log("resp", response);

    const products = response.data.data.products.edges.map(({ node }: any) => ({
      id: node.id,
      bodyHtml: node.bodyHtml,
      imageSrc: node.images.nodes[0].src,
    }));

    // Сохранение продуктов в базе данных
    products.forEach(async (product: { id: any }) => {
      const existingProduct = await ProductModel.findOne({ id: product.id });
      if (!existingProduct) {
        await ProductModel.create(product);
      }
    });

    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

const getProducts = async (): Promise<Product[]> => {
  try {
    return await ProductModel.find({}, { _id: 0, __v: 0 });
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

app.get("/api/products", async (req: Request, res: Response) => {
  console.log("test");
  try {
    const cachedProducts = await getProducts();

    console.log("cachedProd", cachedProducts);
    if (cachedProducts.length === 0) {
      console.log("cached", cachedProducts.length);
      const shopifyProducts = await getShopifyProducts();
      res.json(shopifyProducts);
    } else {
      res.json(cachedProducts);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
