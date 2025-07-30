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
    if (req.isAuthenticated()) {
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
      
      return res.render("folder", {
        folder,
        files,
      });
    } else {
      return res.redirect("/");
    }
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

// TODO
router.post(
  "/delete-folder/:folderId",
  ensureAuthenticated,
  async (req, res, next) => {}
);

module.exports = router;
