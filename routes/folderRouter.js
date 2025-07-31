const express = require("express");
const router = express.Router();
const prisma = require("../prisma.js");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/new", (req, res) => {
  res.render("new-folder");
});

router.get("/:folderId", ensureAuthenticated, async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.folderId, 10);

    if (isNaN(folderId)) {
      return res.status(400).send("Invalid folder ID");
    }

    const [folder, files] = await Promise.all([
      prisma.folder.findUnique({
        where: { id: folderId, authorId: req.user.id },
      }),
      prisma.file.findMany({
        where: {
          authorId: req.user.id,
          folderId: folderId,
        },
      }),
    ]);

    if (!folder) {
      throw new Error("Folder not found or not authorized");
    }

    return res.render("folder", {
      folder,
      files,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/new", ensureAuthenticated, async (req, res, next) => {
  try {
    await prisma.folder.create({
      data: {
        name: req.body.name,
        authorId: req.user.id,
      },
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post(
  "/delete-folder/:folderId",
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const folderId = parseInt(req.params.folderId, 10);

      await prisma.file.updateMany({
        where: {
          id: folderId,
          authorId: req.user.id,
        },
        data: {
          folderId: null,
        },
      });

      await prisma.folder.delete({
        where: {
          id: folderId,
          authorId: req.user.id,
        },
      });

      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
