const express = require("express");
const router = express.Router();
const aiRouter = require("./ai");

router.use("/", aiRouter);

module.exports = router;
