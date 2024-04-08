import express from "express";
import {
  phoneLogin,
  verifyOtp,
  logout,
  updateProfile,
  registerEmployee,
  getEmployeeByCustomId,
} from "../../controllers/account/employee.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import { assignNewUser } from "../../controllers/assignedUsers.js";

const router = express.Router();

router.post("/new", registerEmployee);
router.post("/phoneLogin", phoneLogin);
router.post("/verifyOtp", verifyOtp);
router.get("/getEmployeeByCustomId", getEmployeeByCustomId);
router.post("/logout", isAuthenticated, logout);
router.patch("/me/update", isAuthenticated, updateProfile);

export default router;
