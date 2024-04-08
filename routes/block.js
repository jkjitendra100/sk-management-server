import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { blockUser, getAllMyBlockedUsers } from "../controllers/block.js";

const router = express.Router();

router.post("/new", isAuthenticated, blockUser);
router.get("/my", isAuthenticated, getAllMyBlockedUsers);

export default router;
