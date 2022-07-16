const { v4: uuidv4 } = require('uuid')

const minioClient = require('../db/minio.db.js')

const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')

const Item = require('../model/item.model.js')

const { findByItemId } = require('../service/item.service.js')

const bucket = process.env.MINIO_BUCKET_ITEM_IMAGE

const uploadImage = async (files, itemId, buyerId) => {
    try{
        if(!files){
            throw new BadRequestException(`require file.`)
        }

        const item = await findByItemId(itemId, buyerId)

        if(!item){
            throw new NotFoundException(`Item id: ${itemId} not found.`)
        }else if(item.order.status !== 'ON_CART'){
            throw new BadRequestException(`item not allowed to upload image.`)
        }

        const imageNames = []

        for (let i=0; i< files.length; i++) {
            const extArray = files[i].mimetype.split("/")
            const extension = extArray[extArray.length - 1]
            const imageName = `${uuidv4()}.${extension}`

            const metadata = {
            'Content-type': files[i].mimetype,
            }
        
            minioClient.putObject(bucket, imageName, files[i].buffer, metadata)

            item.referencePicture.push(imageName)
            await item.save()

            imageNames.push(imageName)
        }
        
        return imageNames
    }catch(error){
        throw error
    }
}

const getImage = async (imageName) => {
    try{
        const dataStream = minioClient.getObject(bucket, imageName)

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

        const checkItem = await findByItemId(item._id, buyerId)

        if(checkItem.order.status !== 'ON_CART'){
            throw new BadRequestException(`item not allowed to delete image.`)
        }

        item.referencePicture = item.referencePicture.filter(key => key !== imageName)

        await item.save()

        minioClient.removeObject(bucket, imageName)

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