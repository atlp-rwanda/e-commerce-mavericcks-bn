import multer from 'multer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileFilter = (req: any, file: any, callback: any) => callback(null, true);

const multerUpload = multer({ fileFilter });

export default multerUpload;
