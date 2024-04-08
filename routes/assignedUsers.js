import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  assignNewUser,
  getAllMyAssignedUsers,
} from "../controllers/assignedUsers.js";

const router = express.Router();

router.post("/new", isAuthenticated, assignNewUser);
router.get("/my/all/:pageNo", isAuthenticated, getAllMyAssignedUsers);

export default router;
