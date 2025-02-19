import mongoose from "mongoose";

// Define the schema for an item in the order
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Define the schema for an order
const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
  items: { type: [itemSchema], required: true },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
