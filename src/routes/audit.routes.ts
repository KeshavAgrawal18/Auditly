import { Router } from "express";
import { AuditController } from "@/controllers/audit.controller";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const controller = new AuditController();

// Routes
/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Endpoints for retrieving and managing audit logs.
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Retrieve audit logs
 *     description: Fetch a list of audit logs with optional filters by action and date range.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []  # Specify that this route requires Bearer token authentication
 *     parameters:
 *       - in: query
 *         name: from
 *         description: Start date for filtering audit logs (ISO format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-01"
 *       - in: query
 *         name: to
 *         description: End date for filtering audit logs (ISO format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-12-31"
 *       - in: query
 *         name: action
 *         description: Action type to filter logs (e.g., USER_LOGIN, USER_LOGOUT)
 *         required: false
 *         schema:
 *           type: string
 *           example: "USER_LOGIN"
 *     responses:
 *       200:
 *         description: A successful response containing audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: The unique identifier for the audit log entry
 *                     example: "log-001"  # Simplified dummy ID
 *                   userId:
 *                     type: string
 *                     description: The unique identifier for the user associated with the audit log
 *                     example: "user-001"  # Simplified dummy user ID
 *                   companyId:
 *                     type: string
 *                     description: The unique identifier for the company associated with the audit log
 *                     example: "company-001"  # Simplified dummy company ID
 *                   action:
 *                     type: string
 *                     description: The action that triggered the audit log
 *                     example: "USER_LOGIN"
 *                   entity:
 *                     type: string
 *                     nullable: true
 *                     description: The entity related to the action (if any)
 *                     example: "user"  # Example entity name, like "user"
 *                   entityId:
 *                     type: string
 *                     nullable: true
 *                     description: The unique identifier of the entity related to the action (if any)
 *                     example: "user-001"  # Simplified entity ID like "user-001"
 *                   metadata:
 *                     type: object
 *                     description: Additional metadata related to the action
 *                     example: { "ip": "127.0.0.1", "browser": "Chrome" }  # Example metadata
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time when the audit log was created
 *                     example: "2026-02-04T16:08:34.551Z"  # Example date-time
 *       401:
 *         description: Unauthorized - Authentication is required
 *       500:
 *         description: Internal server error
 */
router.get("/", requireAuth, controller.getAuditLogs.bind(controller));

export default router;
