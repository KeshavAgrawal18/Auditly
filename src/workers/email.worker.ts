import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { EmailService } from "../services/email.service";
import { AuditService } from "../services/audit.service";

// services
const emailService = new EmailService();
const auditService = new AuditService();

// worker
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

      // log success when job finishes successfully
      await auditService.createLog({
        action: "EMAIL_SENT",
        userId: job.data.userId,
        companyId: job.data.companyId,
        metadata: {
          to: job.data.to,
          type: job.name,
        },
      });

      console.log(`Finished job ${job.id}`);
    } catch (error) {
      console.error(`Job failed ${job.id}`, error);

      // log only final failure
      if (job.attemptsMade + 1 === job.opts.attempts) {
        await auditService.createLog({
          action: "EMAIL_FAILED",
          userId: job.data.userId,
          companyId: job.data.companyId,
          metadata: {
            to: job.data.to,
            type: job.name,
            error: (error as Error).message,
          },
        });
      }

      throw error; // REQUIRED for retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

// lifecycle logs (keep for dev/debug)
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Email worker running...");
