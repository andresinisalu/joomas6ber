const multer = require('multer')

module.exports = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/gif' && file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only image files are allowed!'), false)
    }
    cb(null, true)
  }
})