const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')

const { uploadImage, getImage, deleteImage } = require('../service/itemImage.service.js')

const express = require('express')
const router = new express.Router()

const multer  = require('multer')
const upload = multer({
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new BadRequestException('Please upload image'))
        }
        cb(null,true);
    }
})

router.post('/upload/:itemId', upload.single('image'), async (req, res, next) => {
    try{
        if(!req.file){
            throw new NotFoundException('Please upload image.')
        }

        const imageName = await uploadImage(req.file, req.params.itemId)

        res.status(201).send({ 
            data:{
                imageName,
                message: `upload ${imageName} sucessful.`
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/get/:imageName', async (req, res, next) => {
    try{
        if(!req.params.imageName){
            throw new BadRequestException('require imageName params.')
        }

        const dataStream = await getImage(req.params.imageName)

        dataStream.on('data',(chunk) => {
            res.write(chunk)
        })

        dataStream.on('end', () => {
            return res.end()
        })
    }catch(error){
        next(error)
    }
})

router.delete('/delete/:imageName', async (req, res, next) => {
    try{
        if(!req.params.imageName){
            throw new BadRequestException('required imageName params.')
        }

        await deleteImage(req.params.imageName)

        res.send({
            data:{
                imageName: req.params.imageName,
                message: `delete ${req.params.imageName} successful.`
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router