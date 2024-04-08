import express from "express";
import {
  getGenderWiseUsersProfile,
  getMyProfile,
  getNearByMatches,
  getUserProfileById,
} from "../controllers/matches.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/genderWise/:gender", isAuthenticated, getGenderWiseUsersProfile);
router.get("/myProfile", isAuthenticated, getMyProfile);
router.get("/userProfile/:id", isAuthenticated, getUserProfileById);
router.get("/nearByMatches/:state/:gender", isAuthenticated, getNearByMatches);

export default router;
