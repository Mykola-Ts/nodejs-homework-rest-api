import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError } from "../helpers/index.js";
import { controllerWrapper } from "../decorators/index.js";

const { JWT_SECRET } = process.env;
const unauthorizedErrorMessage = "Not authorized";

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw HttpError(401, unauthorizedErrorMessage);
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    throw HttpError(401, unauthorizedErrorMessage);
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);

    if (!user || user.token !== token) {
      throw HttpError(401, unauthorizedErrorMessage);
    }

    req.user = user;

    next();
  } catch (error) {
    next(HttpError(401, unauthorizedErrorMessage));
  }
};

export default controllerWrapper(authenticate);
