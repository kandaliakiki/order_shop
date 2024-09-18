import mongoose from "mongoose";

export interface ProductData {
  name: string;
  price: number;
  category: mongoose.Types.ObjectId; // Change category to reference Category schema
  // Add any other fields defined in your product schema
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Link to Category schema
  imageUrl: { type: String, default: "" },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
