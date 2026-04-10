import cloudinary from '../config/cloudinary.config';
import fs from 'fs';

export const uploadToCloudinary = async (fileSource: string, folder: string, resourceType: "auto" | "image" | "video" | "raw" = "auto"): Promise<string> => {
  try {
    // Check if the fileSource is a base64 string
    const isBase64 = fileSource.startsWith('data:');
    
    const options = {
      folder: `portfolio/${folder}`,
      resource_type: resourceType,
    };

    const result = await cloudinary.uploader.upload(fileSource, options);
    
    // If it was a local file (not base64), delete it after upload
    if (!isBase64 && fs.existsSync(fileSource)) {
      fs.unlinkSync(fileSource);
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload to Cloudinary");
  }
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (fileSources: string[], folder: string): Promise<string[]> => {
  const uploadPromises = fileSources.map(source => uploadToCloudinary(source, folder));
  return Promise.all(uploadPromises);
};
