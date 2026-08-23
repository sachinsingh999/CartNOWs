import mongoose from "mongoose";

/**
 * Safely executes a callback inside a MongoDB transaction session with automatic write-conflict retry logic.
 */
export const runInTransaction = async (callback, maxRetries = 3) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      session.startTransaction();
      isTransactionActive = true;

      const result = await callback(session);

      await session.commitTransaction();
      isTransactionActive = false;
      return result;
    } catch (error) {
      if (isTransactionActive) {
        try {
          await session.abortTransaction();
        } catch (abortErr) {
          console.error("Transaction abort error:", abortErr.message);
        }
      }

      const isWriteConflict =
        error.message &&
        (error.message.includes("Write conflict") ||
          error.message.includes("TransientTransactionError") ||
          error.codeName === "WriteConflict");

      if (isWriteConflict && attempts < maxRetries) {
        // Small backoff before retrying transient write conflict
        await new Promise((resolve) => setTimeout(resolve, attempts * 25));
        continue;
      }

      // Check if error is due to Standalone Mongo without Replica Set
      if (
        error.message &&
        (error.message.includes("Transaction numbers are only allowed on a replica set") ||
          error.message.includes("standalone"))
      ) {
        return await callback(null);
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }
};
