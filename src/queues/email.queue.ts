import { Queue } from "bullmq";
import { redisConnection } from "@/config/redis";

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
});

export const addEmailJob = async (name: string, data: unknown) => {
  return emailQueue.add(name, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
