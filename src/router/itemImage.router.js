const express = require('express')
const router = new express.Router()

const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')

const { uploadImage, getImage, deleteImage } = require('../service/itemImage.service.js')
const { verifyAuthAT: authATBuyer } = require('../middleware/buyer.auth.middleware.js')

const upload = require('../util/upload.util.js')

router.post('/upload/:itemId', authATBuyer, upload.array('image'), async (req, res, next) => {
    try{
        if(!req.files){
            throw new NotFoundException('Please upload image.')
        }

        const imageNames = await uploadImage(req.files, req.params.itemId, req.buyer._id)

        const imagesOriginalname = req.files.map(file => file.originalname)

        res.status(201).send({ 
            data:{
                imageNames,
                message: `upload ${imagesOriginalname.toString()} sucessful.`
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

router.delete('/delete/:imageName', authATBuyer, async (req, res, next) => {
    try{
        if(!req.params.imageName){
            throw new BadRequestException('required imageName params.')
        }

        await deleteImage(req.params.imageName, req.buyer._id)

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