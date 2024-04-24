import { v2 as cloudinary } from 'cloudinary';
// const config = require("config");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadImage = async (imageData: Buffer): Promise<string> => {
  const base64Image = imageData.toString('base64');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, { public_id: 'user_image' }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const url: any = result?.secure_url;
        resolve(url);
      }
    });
  });
};
export default uploadImage;
