import { NextFunction, Request, Response } from 'express';
import multerUpload from '../helpers/multer';

export const handleFileUploads = (req: Request, res: Response, next: NextFunction) => {
  if (req.files) {
    multerUpload.array('images', 8)(req, res, next);
  } else {
    multerUpload.single('image')(req, res, next);
  }
};
