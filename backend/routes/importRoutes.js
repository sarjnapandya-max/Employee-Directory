const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadExcelFile,
  previewExcelFile,
  importExcelData,
} = require("../controllers/importController");
const { protect } = require("../middleware/authMiddleware");
const { superAdminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xlsx", ".xls"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx and .xls files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Excel upload route
router.post(
  "/upload",
  protect,
  superAdminOnly,
  upload.single("file"),
  uploadExcelFile
);

router.post(
  "/preview",
  protect,
  superAdminOnly,
  upload.single("file"),
  previewExcelFile
);

router.post(
  "/import",
  protect,
  superAdminOnly,
  upload.single("file"),
  importExcelData
);

module.exports = {
  router,
  upload,
};