import { connectToDB } from "../mongoose";
import CustomerDeliveryAddress from "../models/customerDeliveryAddress.model";

/**
 * Get the saved delivery address for a phone number
 */
export const getCustomerDeliveryAddress = async (
  phoneNumber: string
): Promise<{ deliveryAddress: string; pickupTime?: string } | null> => {
  await connectToDB();

  try {
    const record = await CustomerDeliveryAddress.findOne({ phoneNumber });
    if (!record) return null;
    return {
      deliveryAddress: record.deliveryAddress,
      pickupTime: record.pickupTime,
    };
  } catch (error) {
    console.error("Error getting customer delivery address:", error);
    return null;
  }
};

/**
 * Save or update the delivery address for a phone number
 */
export const saveCustomerDeliveryAddress = async (
  phoneNumber: string,
  deliveryAddress: string,
  pickupTime?: string
): Promise<boolean> => {
  await connectToDB();

  try {
    await CustomerDeliveryAddress.findOneAndUpdate(
      { phoneNumber },
      { 
        phoneNumber,
        deliveryAddress,
        pickupTime,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error("Error saving customer delivery address:", error);
    return false;
  }
};

/**
 * Delete the delivery address for a phone number (optional, for cleanup)
 */
export const deleteCustomerDeliveryAddress = async (
  phoneNumber: string
): Promise<boolean> => {
  await connectToDB();

  try {
    await CustomerDeliveryAddress.deleteOne({ phoneNumber });
    return true;
  } catch (error) {
    console.error("Error deleting customer delivery address:", error);
    return false;
  }
};