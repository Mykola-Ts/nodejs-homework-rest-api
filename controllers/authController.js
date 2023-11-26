import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { controllerWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ "user.email": email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    user: { ...req.body, password: hashPassword },
  });

  res.status(201).json({
    user: {
      email: newUser.user.email,
      subscription: newUser.user.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ "user.email": email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  await User.findByIdAndUpdate(user._id, { token });

  const { subscription } = user.user;

  res.json({ token, user: { email, subscription } });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user.user;

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
    "user.subscription": subscription,
  });

  if (!user) {
    throw HttpError(404, "Not found");
  }

  res.json(user);
};

export default {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
  updateSubscription: controllerWrapper(updateSubscription),
};
