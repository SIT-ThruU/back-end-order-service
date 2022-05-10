const multer  = require('multer')
const BadRequestException = require('../exception/BadRequest.exception')

const upload = multer({
    fileFilter(req, file, cb){
        if(!file.originalname.toLocaleLowerCase().match(/\.(png|jpeg|jpg)$/)){
            return cb(new BadRequestException('Please upload image'))
        }
        cb(null,true);
    }
})

module.exports = upload