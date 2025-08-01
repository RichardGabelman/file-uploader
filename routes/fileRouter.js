const express = require("express");
const prisma = require("../prisma");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");

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
      const folderId = req.body.folderId
        ? parseInt(req.body.folderId, 10)
        : null;

      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });

      fs.unlinkSync(req.file.path);

      await prisma.file.create({
        data: {
          name: req.file.originalname,
          authorId: req.user.id,
          size: req.file.size,
          folderId: folderId,
          storageKey: result.public_id,
          storageUrl: result.secure_url,
        },
      });

      res.redirect(folderId ? `/folders/${folderId}` : "/");
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:fileId/download", ensureAuthenticated, async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        authorId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).send("Not found or not authorized");
    }

    const response = await axios({
      url: file.storageUrl,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (err) {
    next(err);
  }
})

router.post(
  "/delete-file/:fileId",
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const fileId = parseInt(req.params.fileId, 10);

      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          authorId: req.params.id,
        },
      });

      if (!file) {
        return res.status(404).send("File not found or not authorized");
      }

      await cloudinary.uploader.destroy(file.storageKey, { resource_type: "raw" });

      await prisma.file.delete({
        where: {
          id: fileId,
          authorId: req.user.id,
        }
      });

      res.redirect(req.get('referer'));
    } catch (err) {
      next(err);
    }
  }
);

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

module.exports = router;
