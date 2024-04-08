import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addFollowUp, getUserFollowUps } from "../controllers/followUp.js";

const router = express.Router();

router.post("/new", isAuthenticated, addFollowUp);
router.get("/userFollowUps/:userId", isAuthenticated, getUserFollowUps);

export default router;
