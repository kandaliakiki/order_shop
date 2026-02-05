import { connectToDB } from "../mongoose";
import CommandLog, { CommandLogData } from "../models/commandLog.model";

export const createCommandLog = async (
  logData: Omit<CommandLogData, "logId" | "executedAt">
) => {
  await connectToDB();

  try {
    const log = new CommandLog({
      ...logData,
      executedAt: new Date(),
    });
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating command log:", error);
    throw error;
  }
};

export const fetchCommandLogs = async (limit: number = 0) => {
  await connectToDB();

  try {
    const query = CommandLog.find()
      .populate("messageId")
      .sort({ executedAt: -1 });

    if (limit > 0) {
      query.limit(limit);
    }

    return await query;
  } catch (error) {
    console.error("Error fetching command logs:", error);
    throw error;
  }
};

export const fetchCommandLogsByCommand = async (command: string) => {
  await connectToDB();

  try {
    return await CommandLog.find({ command })
      .populate("messageId")
      .sort({ executedAt: -1 });
  } catch (error) {
    console.error("Error fetching command logs by command:", error);
    throw error;
  }
};
