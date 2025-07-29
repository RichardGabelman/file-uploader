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

router.post("/new", ensureAuthenticated, async (req, res, next) => {
  try {
    await prisma.folder.create({
      data: {
        name: req.body.name,
        authorId: req.user.id
      },
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
