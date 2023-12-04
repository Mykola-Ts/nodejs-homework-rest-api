import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar";
import { User } from "../models/User.js";
import { controllerWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  await User.findByIdAndUpdate(user._id, { token });

  const { subscription } = user;

  res.json({ token, user: { email, subscription } });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findOneAndUpdate(_id, { token: "" });

  res.status(204).send();
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  const user = await User.findOneAndUpdate(_id, {
    subscription,
  });

  if (!user) {
    throw HttpError(404, "Not found");
  }

  res.json(user);
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "missing required avatarURL");
  }

  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const avatarsPath = path.resolve("public", "avatars");

  await Jimp.read(oldPath)
    .then((file) => {
      return file.resize(250, 250).write(oldPath);
    })
    .catch((error) => console.log(error.message));

  const newPath = path.join(avatarsPath, filename);

  await fs.rename(oldPath, newPath);

  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

export default {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
  updateSubscription: controllerWrapper(updateSubscription),
  updateAvatar: controllerWrapper(updateAvatar),
};
