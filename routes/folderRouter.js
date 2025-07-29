const express = require('express');
const router = express.Router();
const prisma = require("../prisma.js");

router.get("/new", (req, res) => {
  res.render("new-folder");
});

router.post("/new", async (req, res, next) => {
  
})

module.exports = router;