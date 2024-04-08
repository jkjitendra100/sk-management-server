import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { blockUser, getAllMyBlockedUsers } from "../controllers/block.js";
import { getRegisteredUsersCount } from "../controllers/dashboard.js";

const router = express.Router();

router.get("/usersCount", isAuthenticated, getRegisteredUsersCount);
router.get("/my", isAuthenticated, getAllMyBlockedUsers);

export default router;
