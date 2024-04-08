import express from "express";
import {
  phoneLogin,
  deletePhoto,
  getAllUsers,
  getSingleUsers,
  getUserDetails,
  logout,
  updateProfile,
  getMyPhotos,
  updateRole,
  uploadPhotos,
  verifyOtp,
  getUserDetailsByCustomId,
} from "../../controllers/account/user.js";
import isAdmin from "../../middlewares/isAdmin.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import singleUpload from "../../middlewares/multer.js";

const router = express.Router();

router.post("/phoneLogin", phoneLogin);
router.post("/verifyOtp", verifyOtp);
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUserDetails);
router.get("/myImages", isAuthenticated, getMyPhotos);
router.get("/:customId", isAuthenticated, getUserDetailsByCustomId);
router.patch("/me/update", isAuthenticated, updateProfile);
router.get("/allUsers/:pageNo", isAuthenticated, getAllUsers);
router.get("/admin/all/:id", isAdmin, getSingleUsers);
router.patch("/admin/all/:id/update", isAdmin, updateRole);
router.patch("/photos/:userId", singleUpload, uploadPhotos); // User ID
router.delete("/deleteImage/:id", isAuthenticated, deletePhoto);

export default router;
