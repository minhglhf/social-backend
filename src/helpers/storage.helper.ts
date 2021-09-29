import { diskStorage } from 'multer';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
    req.fileValidationError = 'only image files allowed';
    return callback(null, false);
  }
  callback(null, true);
};

export const storage = diskStorage({
  destination: './src/uploads/filestorage',
  filename: (req: any, file: Express.Multer.File, cb: any) => {
    cb(null, `${file.originalname}`);
  },
});
