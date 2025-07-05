import multer from "multer";

// Storage configuration for saving files temporarily
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // make sure this folder exists or create it
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});


export const upload=multer({
    storage,
})