import { connectToDB } from "../mongoose";
import WasteLog, { WasteLogData } from "../models/wasteLog.model";

export const fetchWasteLogs = async (limit: number = 0) => {
  await connectToDB();

  try {
    const query = WasteLog.find().sort({ loggedAt: -1 });

    if (limit > 0) {
      query.limit(limit);
    }

    return await query;
  } catch (error) {
    console.error("Error fetching waste logs:", error);
    throw error;
  }
};

export const fetchWasteLogsByDateRange = async (from: Date, to: Date) => {
  await connectToDB();

  try {
    return await WasteLog.find({
      loggedAt: {
        $gte: from,
        $lte: to,
      },
    }).sort({ loggedAt: -1 });
  } catch (error) {
    console.error("Error fetching waste logs by date range:", error);
    throw error;
  }
};

export const createWasteLog = async (wasteLogData: Omit<WasteLogData, "wasteId" | "loggedAt">) => {
  await connectToDB();

  try {
    const wasteLog = new WasteLog({
      ...wasteLogData,
      loggedAt: new Date(),
    });
    await wasteLog.save();
    return wasteLog;
  } catch (error) {
    console.error("Error creating waste log:", error);
    throw error;
  }
};
