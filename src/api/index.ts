import express from "express";

import MessageResponse from "../interfaces/MessageResponse";
import user from "./user";
import authRoute from "./authRoute";
import tweetRoute from "./tweetRoute";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/user", user);
router.use("/authenticate", authRoute);
router.use("/tweet", tweetRoute);

export default router;
