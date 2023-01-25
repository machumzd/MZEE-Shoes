const multer=require("multer")
const path = require('path');

//set storage
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

const store = multer({ storage: storage })

module.exports = store;

//for adding multiple images 


// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/images')
//     },
//     filename: (req, file, cb) => {
//         let ext = path.extname(file.originalname)
//         cb(null, file.fieldname + '-' + Date.now() + ext)
//     }
// });

// let upload = multer({ storage: storage }).array('images', 12);

// module.exports = upload;