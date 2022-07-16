const { v4: uuidv4 } = require('uuid')

const minioClient = require('../db/minio.db.js')

const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')
const ItemDetail = require('../model/itemDetail.model.js')

const { findByItemDetailId } = require('../service/ItemDetail.service.js')
const { checkItemDetail } = require('./carrier.service.js')

const bucket = process.env.MINIO_BUCKET_ITEM_DETAIL_IMAGE

const uploadImage = async (files, itemDetailId, carrierId) => {
    try{
        if(!files){
            throw new BadRequestException(`require file.`)
        }

        const hasItemDetail = await checkItemDetail(carrierId, itemDetailId)

        if(hasItemDetail.itemId.orderId.status !== 'IN_PROGRESS_SHOPPING'){
            throw new BadRequestException(`itemDetail are not allow to upload image.`)
        }

        const itemDetail = await findByItemDetailId(itemDetailId)

        const imageNames = []

        for (let i=0; i< files.length; i++) {
            const extArray = files[i].mimetype.split("/")
            const extension = extArray[extArray.length - 1]
            const imageName = `${uuidv4()}.${extension}`

            const metadata = {
            'Content-type': files[i].mimetype,
            }
        
            minioClient.putObject(bucket, imageName, files[i].buffer, metadata)

            itemDetail.referencePicture.push(imageName)
            await itemDetail.save()

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

const deleteImage = async (imageName, carrierId) => {
    try{
        const itemDetail = await ItemDetail.findOne({
            referencePicture: imageName
        }).populate({
            path: 'itemId',
            select:['orderId'],
            populate:{
                path: 'orderId',
                select: ['_id', 'status'],
                model: 'Order',
                match: { carrierId }
            }
        }).exec()

        if(!itemDetail){
            throw new BadRequestException(`Item contain with ${imageName} are not found.`)
        }else if(itemDetail.itemId.orderId === null){
            throw new BadRequestException('carrierId and itemDetailId not match.')
        }else if(itemDetail.itemId.orderId.status !== 'IN_PROGRESS_SHOPPING'){
            throw new BadRequestException(`itemDetail are not allow to delete image.`)
        }

        itemDetail.referencePicture = itemDetail.referencePicture.filter(key => key !== imageName)

        await itemDetail.save()

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