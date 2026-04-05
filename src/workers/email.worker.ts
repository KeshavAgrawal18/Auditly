import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { EmailService } from "../services/email.service";

// Create an instance of EmailService
const emailService = new EmailService();

// Create worker
const worker = new Worker(
  "emailQueue",
  async (job: Job) => {
    console.log(`Starting job ${job.id} (${job.name})`);

    try {
      if (job.name === "verification") {
        await emailService.sendVerificationEmail(
          job.data.to,
          job.data.name,
          job.data.verificationToken,
        );
      } else if (job.name === "reset") {
        await emailService.sendPasswordResetEmail(
          job.data.to,
          job.data.name,
          job.data.resetToken,
        );
      } else {
        console.warn(`Unknown job type: ${job.name}`);
      }

      console.log(`Finished job ${job.id}`);
    } catch (error) {
      console.error(`Job failed ${job.id}`, error);
      throw error; // for retries
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

// lifecycle logs
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Email worker running...");
