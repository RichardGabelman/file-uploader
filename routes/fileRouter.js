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

// TODO
router.get("/:fileId", ensureAuthenticated, async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);

    if (isNaN(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        authorId: req.user.id,
      },
    });

    if (!file) {
      throw new Error("File not found or not authorized");
    }

    return res.render("file", {
      file,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("uploadedFile"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    try {
      const folderId = req.body.folderId
        ? parseInt(req.body.folderId, 10)
        : null;
      console.log("folderId:", folderId);

      await prisma.file.create({
        data: {
          name: req.file.originalname,
          authorId: req.user.id,
          size: req.file.size,
          folderId: folderId,
        },
      });

      console.log(`File ${req.file.originalname} uploaded successfully!`);
      res.redirect(folderId ? `/folders/${folderId}` : "/");
    } catch (err) {
      next(err);
    }
  }
);

// TODO
router.post(
  "/delete-file/:fileId",
  ensureAuthenticated,
  async (req, res, next) => {}
);

module.exports = router;
