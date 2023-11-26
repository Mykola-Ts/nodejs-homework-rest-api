import express from "express";
import {
  authenticate,
  isEmptyBody,
  isValidId,
} from "../../middlewares/index.js";
import contactsControllers from "../../controllers/contactsController.js";
import { validateBody } from "../../decorators/index.js";
import {
  contactAddSchema,
  contactFavoriteSchema,
  contactUpdateSchema,
} from "../../schmes/contactSchemes.js";

const { getAll, getById, add, deleteById, updateById } = contactsControllers;

const contactRouter = express.Router();

contactRouter.use(authenticate);

contactRouter.get("/", getAll);

contactRouter.get("/:id", isValidId, getById);

contactRouter.post("/", isEmptyBody, validateBody(contactAddSchema), add);

contactRouter.delete("/:id", isValidId, deleteById);

contactRouter.put(
  "/:id",
  isValidId,
  isEmptyBody,
  validateBody(contactUpdateSchema),
  updateById
);

contactRouter.patch(
  "/:id/favorite",
  isValidId,
  validateBody(contactFavoriteSchema),
  updateById
);

export default contactRouter;
