const minioClient = require('../db/minio.db.js')

const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')

const Item = require('../model/item.model.js')

const { findByItemId } = require('../service/item.service.js')

const bucket = process.env.MINIO_BUCKET_ITEM_IMAGE

const uploadImage = async (file, itemId, buyerId) => {
    try{
        if(!file){
            throw new BadRequestException(`require file.`)
        }

        const item = await findByItemId(itemId, buyerId)

        if(!item){
            throw new NotFoundException(`Item id: ${itemId} not found.`)
        }

        const imageName = `${itemId}-${file.originalname}`

        if(!item.referencePicture.includes(imageName)){

            const metadata = {
                'Content-type': file.mimetype,
            }
        
            await minioClient.putObject(bucket, imageName, file.buffer, metadata)

            item.referencePicture.push(imageName)
            await item.save()

            return imageName
        }else{
            throw new BadRequestException(`${file.originalname} already exist.`)
        }
    }catch(error){
        throw error
    }
}

const getImage = async (imageName) => {
    try{
        const dataStream = await minioClient.getObject(bucket, imageName)

        return dataStream
    }catch(error){
        if(error.code === 'NoSuchKey'){
            throw new NotFoundException(`${imageName} not found.`)
        }else{
            throw error
        }
    }
}

const deleteImage = async (imageName, buyerId) => {
    try{
        const item = await Item.findOne({
            referencePicture: imageName
        })

        if(!item){
            throw new BadRequestException(`Item contain with ${imageName} are not found.`)
        }

        await findByItemId(item._id, buyerId)

        item.referencePicture = item.referencePicture.filter(key => key !== imageName)

        await item.save()

        await minioClient.removeObject(bucket, imageName)

        return imageName
    }catch(error){
        throw error
    }
}

module.exports = {
    uploadImage,
    getImage,
    deleteImage
}