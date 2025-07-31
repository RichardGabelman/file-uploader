const express = require("express");
const passport = require("passport");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma.js");

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/sign-up", (req, res) =>
  res.render("sign-up-form", { errors: [] })
);

router.post(
  "/sign-up",
  body("confirm")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match!"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up-form", { errors: errors.array() });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: req.body.username },
      });
      if (existingUser) {
        return res.status(400).render("sign-up-form", {
          errors: [{ msg: "Username already taken" }],
        });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
        },
      });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
