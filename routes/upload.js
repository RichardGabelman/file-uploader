const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.post(
  "/",
  ensureAuthenticated,
  upload.single("uploadedFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    console.log(`File ${req.file.originalname} uploaded successfully!`);
    res.redirect("/");
  }
);

module.exports = router;
