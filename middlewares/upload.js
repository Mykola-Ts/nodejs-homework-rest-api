import multer from "multer";
import path from "path";

const destination = path.resolve("tmp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    const filename = `${req.user._id}_${file.originalname}`;

    cb(null, filename);
  },
});

const limits = {
  fileSize: 5 * 1048576,
};

export const upload = multer({
  storage,
  limits,
});
