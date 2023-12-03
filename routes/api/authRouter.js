import express from "express";
import authController from "../../controllers/authController.js";
import {
  userSigninSchema,
  userSignupSchema,
} from "../../schmes/authSchemes.js";
import { validateBody } from "../../decorators/index.js";
import { authenticate, isEmptyBody, upload } from "../../middlewares/index.js";

const authRouter = express.Router({});

authRouter.post(
  "/register",
  isEmptyBody,
  validateBody(userSignupSchema),
  authController.register
);

authRouter.post(
  "/login",
  isEmptyBody,
  validateBody(userSigninSchema),
  authController.login
);

authRouter.post("/logout", authenticate, authController.logout);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.patch(
  "/",
  authenticate,
  isEmptyBody,
  authController.updateSubscription
);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatarURL"),
  authController.updateAvatar
);

export default authRouter;
