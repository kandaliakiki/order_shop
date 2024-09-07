import mongoose from "mongoose";

export interface ProductData {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  // Add any other fields defined in your product schema
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, minlength: 3, maxlength: 30 },
  imageUrl: { type: String, default: "" },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
