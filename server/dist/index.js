"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importStar(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3009;
app.use((0, cors_1.default)());
mongoose_1.default.connect("mongodb://localhost/shopifyProducts", {
    useUnifiedTopology: true,
});
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Connected to db");
});
const productSchema = new mongoose_1.Schema({
    id: String,
    bodyHtml: String,
    imageSrc: String,
});
const ProductModel = mongoose_1.default.model("Product", productSchema);
const getShopifyProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("test");
    const accessToken = "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";
    const shopifyGraphQLUrl = "https://cpb-new-developer.myshopify.com/admin/api/2023-10/graphql.json";
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
        const response = yield axios_1.default.post(shopifyGraphQLUrl, { query }, { headers: { "X-Shopify-Access-Token": accessToken } });
        console.log("resp", response);
        const products = response.data.data.products.edges.map(({ node }) => ({
            id: node.id,
            bodyHtml: node.bodyHtml,
            imageSrc: node.images.nodes[0].src,
        }));
        // Сохранение продуктов в базе данных
        products.forEach((product) => __awaiter(void 0, void 0, void 0, function* () {
            const existingProduct = yield ProductModel.findOne({ id: product.id });
            if (!existingProduct) {
                yield ProductModel.create(product);
            }
        }));
        return products;
    }
    catch (error) {
        console.error("Error getting products:", error);
        throw error;
    }
});
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield ProductModel.find({}, { _id: 0, __v: 0 });
    }
    catch (error) {
        console.error("Error getting products:", error);
        throw error;
    }
});
app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("test");
    try {
        const cachedProducts = yield getProducts();
        console.log("cachedProd", cachedProducts);
        if (cachedProducts.length === 0) {
            console.log("cached", cachedProducts.length);
            const shopifyProducts = yield getShopifyProducts();
            res.json(shopifyProducts);
        }
        else {
            res.json(cachedProducts);
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
