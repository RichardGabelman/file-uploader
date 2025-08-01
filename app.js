const express = require("express");
const path = require("node:path");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require('./prisma.js');
const passport = require("passport");
const folderRouter = require("./routes/folderRouter.js");
const fileRouter = require("./routes/fileRouter.js");
const authRouter = require("./routes/authRouter.js");
const indexRouter = require("./routes/indexRouter.js");

require("dotenv").config();
require("./config/passport.js");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/folders", folderRouter);

app.use("/files", fileRouter);

app.use("/auth", authRouter);

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

app.use((req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`File Uploader - listening on port ${PORT}!`);
});