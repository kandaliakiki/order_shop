import mongoose from "mongoose";

export interface CustomerDeliveryAddressData {
  phoneNumber: string; // WhatsApp phone number (unique identifier)
  deliveryAddress: string; // The delivery address
  pickupTime?: string; // Preferred delivery time (e.g., "jam 3 sore")
  updatedAt: Date;
}

const customerDeliveryAddressSchema = new mongoose.Schema<CustomerDeliveryAddressData>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    pickupTime: {
      type: String,
      required: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerDeliveryAddress =
  mongoose.models.CustomerDeliveryAddress ||
  mongoose.model<CustomerDeliveryAddressData>("CustomerDeliveryAddress", customerDeliveryAddressSchema);

export default CustomerDeliveryAddress;