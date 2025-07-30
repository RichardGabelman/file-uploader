const express = require("express");
const prisma = require("../prisma");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const [folders, loneFiles] = await Promise.all([
        prisma.folder.findMany({
          where: {
            authorId: req.user.id,
          },
        }),
        prisma.file.findMany({
          where: {
            authorId: req.user.id,
            folderId: null,
          },
        }),
      ]);

      return res.render("index", {
        folders,
        loneFiles,
      });
    } else {
      return res.render("index", { folders: [], loneFiles: [] });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
