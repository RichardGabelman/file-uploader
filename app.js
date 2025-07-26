require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require("express-session");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");