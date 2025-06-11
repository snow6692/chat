import { RequestHandler, Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUser,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers); // Get all users
router.get("/me", getCurrentUser); // Get the current authenticated user
router.get("/:id", getUser); // Get a user by ID
router.post("/", createUser); // Create a new user
router.patch("/:id", updateUser); // Update a user by ID
router.delete("/:id", deleteUser); // Delete a user by ID

export default router;
