import express from "express";
import {
  createProfile,
  getProfileDetails,
  updateAstro,
  updateProfile,
} from "../../controllers/account/profile.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/new", createProfile);
router.get("/my", isAuthenticated, getProfileDetails);
router.put("/update", isAuthenticated, updateProfile);
router.put("/updateAstro", isAuthenticated, updateAstro);

export default router;
