import multer from 'multer'
import path from 'path'

const createStorage = (folder) => {
    return multer.diskStorage({
       destination: function (req, file, cb) {
           cb(null, `./public/${folder}`);
       },
       filename: function (req, file, cb) {
           cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
       }
    });
}

export const uploadProfilePicture = multer({ storage: createStorage('profilePictures') });
export const uploadPostPicture = multer({ storage: createStorage('postPicture') });

