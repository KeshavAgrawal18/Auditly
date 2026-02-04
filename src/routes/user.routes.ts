import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { validateRequest } from "@/middleware/validateRequest";
import { requireAuth, requireRole } from "@/middleware/authMiddleware";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validators/user.validator";
import { cache } from "@/middleware/cacheMiddleware";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (multitenant, company-scoped)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [OWNER, ADMIN, USER]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 */

/**
 * All routes below require authentication
 */
router.use(requireAuth);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users in current company
 *     description: Returns all users belonging to the authenticated user's company.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (ADMIN / OWNER only)
 */
router.get(
  "/",
  requireRole(["ADMIN", "OWNER"]),
  cache({ duration: 300 }),
  userController.getAll,
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: |
 *       - USER can access **their own profile**
 *       - ADMIN / OWNER can access users within the same company
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/:id", cache({ duration: 300 }), userController.getUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a user inside the authenticated user's company.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (ADMIN / OWNER only)
 */
router.post(
  "/",
  requireRole(["ADMIN", "OWNER"]),
  validateRequest(createUserSchema),
  userController.create,
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: |
 *       - USER can update **their own profile**
 *       - ADMIN / OWNER can update users in the same company
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id",
  requireRole(["ADMIN", "OWNER"]),
  validateRequest(updateUserSchema),
  userController.update,
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Only OWNER can delete users in their company.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden (OWNER only)
 *       404:
 *         description: User not found
 */
router.delete("/:id", requireRole(["OWNER"]), userController.delete);

export default router;
