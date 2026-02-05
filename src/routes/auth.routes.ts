import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validators/auth.validator";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();

// Initialize services and controller
const authService = new AuthService();
const authController = new AuthController(authService);

// Routes
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register company and owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - companyName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol
 *                 example: StrongP@ssw0rd!
 *                 x-autocomplete: new-password
 *               companyName:
 *                 type: string
 *                 minLength: 2
 *                 example: Acme Corp
 *     responses:
 *       201:
 *         description: Company and owner registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol
 *                 example: StrongP@ssw0rd!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-12345"  # User's unique ID
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           example: "OWNER"
 *                         companyId:
 *                           type: string
 *                           example: "company-67890"  # ID of the company the user is associated with
 *                         emailVerified:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-02-02T10:55:02Z"  # Time when the user's email was verified
 *                     accessToken:
 *                       type: string
 *                       example: "access-token-12345"  # Simplified access token for authentication
 *                     refreshToken:
 *                       type: string
 *                       example: "refresh-token-67890"  # Refresh token for obtaining a new access token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateRequest(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  authController.refresh,
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requireAuth, authController.me);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register company and owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - companyName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd!
 *               companyName:
 *                 type: string
 *                 example: Acme Corp
 *     responses:
 *       201:
 *         description: Company and owner registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Company and owner registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-12345"  # User's unique ID
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           example: "OWNER"
 *                         companyId:
 *                           type: string
 *                           example: "company-67890"  # ID of the company the user is associated with
 *                         emailVerified:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-02-02T10:55:02Z"  # Time when the user's email was verified
 *                     accessToken:
 *                       type: string
 *                       example: "access-token-12345"  # Simplified access token for authentication
 *                     refreshToken:
 *                       type: string
 *                       example: "refresh-token-67890"  # Refresh token for obtaining a new access token
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post("/logout", requireAuth, authController.logout);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Token not found
 */
router.get(
  "/verify-email/:token",
  validateRequest(verifyEmailSchema),
  authController.verifyEmail,
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent if email exists
 */
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 *       404:
 *         description: Token not found
 */
router.post(
  "/reset-password/:token",
  validateRequest(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
