const express = require('express')
const router = new express.Router()

const { uploadImage, getImage, deleteImage } = require('../service/itemDetailImage.service.js')
const { checkItemDetail } = require('../service/carrier.service.js')
const { verifyAuthAT: authATCarrier } = require('../middleware/carrier.auth.middleware.js')

const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')

const upload = require('../util/upload.util.js')

router.post('/upload/:itemDetailId', authATCarrier, upload.array('image'), async (req, res, next) => {
    try{
        if(!req.params.itemDetailId){
            throw new BadRequestException('required imageName params.')
        }

        if(!req.files){
            throw new NotFoundException('Please upload image.')
        }
        
        await checkItemDetail(req.carrier._id, req.params.itemDetailId)

        const imageNames = await uploadImage(req.files, req.params.itemDetailId)

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

router.delete('/delete/:imageName', authATCarrier, async (req, res, next) => {
    try{
        if(!req.params.imageName){
            throw new BadRequestException('required imageName params.')
        }

        await deleteImage(req.params.imageName, req.carrier._id)

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