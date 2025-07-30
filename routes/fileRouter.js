const express = require("express");
const prisma = require("../prisma");
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
  "/upload",
  ensureAuthenticated,
  upload.single("uploadedFile"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    try {
      await prisma.file.create({
        data: {
          name: req.file.originalname,
          authorId: req.user.id,
          size: req.file.size,
        },
      });
    } catch (err) {
      next(err);
    }
    console.log(`File ${req.file.originalname} uploaded successfully!`);
    res.redirect("/");
  }
);

module.exports = router;
