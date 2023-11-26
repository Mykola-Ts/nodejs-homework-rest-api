import { Contact } from "../models/Contact.js";
import { HttpError } from "../helpers/index.js";
import { controllerWrapper } from "../decorators/index.js";

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, ...filterParams } = req.query;
  const skip = (page - 1) * limit;

  const filter = { owner, ...filterParams };

  const contacts = await Contact.find(filter, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "user.email");

  const total = await Contact.countDocuments(filter);

  res.json({ contacts, total, page, perPage: limit });
};

const getById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const contact = await Contact.findOne({ _id: id, owner });

  if (!contact) {
    throw HttpError(404, "Not found");
  }

  res.json(contact);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;

  const newContact = await Contact.create({ ...req.body, owner });

  res.status(201).json(newContact);
};

const deleteById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const contact = await Contact.findOneAndDelete({ _id: id, owner });

  if (!contact) {
    throw HttpError(404, "Not found");
  }

  res.json({ message: "contact deleted" });
};

const updateById = async (req, res) => {
  const { params, body } = req;
  const { _id: owner } = req.user;

  const contact = await Contact.findOneAndUpdate(
    { _id: params.id, owner },
    body
  );

  if (!contact) {
    throw HttpError(404, "Not found");
  }

  res.json(contact);
};

export default {
  getAll: controllerWrapper(getAll),
  getById: controllerWrapper(getById),
  add: controllerWrapper(add),
  deleteById: controllerWrapper(deleteById),
  updateById: controllerWrapper(updateById),
};
