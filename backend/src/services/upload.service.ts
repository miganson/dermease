import streamifier from "streamifier";
import { cloudinary } from "../config/cloudinary.js";

export async function uploadImageBuffer(buffer: Buffer, folder = "dermease/products") {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

