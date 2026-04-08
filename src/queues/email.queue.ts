import { Queue } from "bullmq";
import { redisConnection } from "@/config/redis";

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
});

export const addEmailJob = async (name: string, data: any) => {
  await emailQueue.add(name, data);
};
