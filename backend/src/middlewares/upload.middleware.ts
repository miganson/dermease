import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(400, "Only image uploads are allowed"));
      return;
    }

    callback(null, true);
  }
});

