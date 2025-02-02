const multer = require('multer');

const path = require('path');
const tmpDir = path.join(__dirname, '../', 'temp');

const multerConfig = multer.diskStorage({
  destination: tmpDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: multerConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
    }
    cb(null, false);
  },
});
module.exports = upload;
