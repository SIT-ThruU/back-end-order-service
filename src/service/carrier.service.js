const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

const Carrier = require('../model/carrier.model.js')
const Order = require('../model/order.model.js')
const ItemDetail = require('../model/itemDetail.model.js')

const NotFoundException = require('../exception/NotFound.exception')
const InternalExpection = require('../exception/Internal.expection.js')
const BadRequestException = require('../exception/BadRequest.exception.js')

const minioClient = require('../db/minio.db.js')

const bucket = process.env.MINIO_BUCKET_AVATAR_IMAGE

const findById = async (id) => {
    try{
        const carrier = await Carrier.findById(id)

        if(!carrier){
            throw new NotFoundException(`Carrier id: ${id} not found.`)
        }

        return carrier
    }catch(error){
        throw error
    }
}

const createCarrier = async (data) => {
    try{
        const requireField = ['cid', 'title', 'fname', 'lname', 'email', 'password', 'dob', 'telNumber', 'address']
        const hasNull = []

        if(!data){
            throw new BadRequestException(`require ${requireField.toString()} field.`)
        }

        requireField.forEach(key => {
            if(!data[key]){
                hasNull.push(key)
            }
        })

        if(hasNull.length !== 0){
            throw new BadRequestException(`require ${hasNull.toString()} field.`)
        }

        const newCarrier = new Carrier({
            ...data
        })

        await newCarrier.save()

        return newCarrier
    }catch(error){
        if(error.name === 'MongoServerError' && error.code === 11000){
            const existField = Object.keys(error.keyPattern)
            throw new BadRequestException(`${existField.toString()} are already exists.`)
        }else if(error.name === 'ValidationError'){
            throw new BadRequestException(`${error.message.substring(error.message.indexOf(':')+1).trim()}`)
        }else{
            throw error
        }
    }
}

const updatecarrier = async (data, carrierId) => {
    try{
        const carrier = await findById(carrierId)

        const updateField = ['title', 'fname', 'lname', 'password', 'telNumber', 'dob', 'address']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        if(Object.keys(filteredData).length === 0){
            throw new BadRequestException('require field.')
        }

        if(filteredData.password){
            carrier.password = filteredData.password
            await carrier.save()
            delete filteredData.password
        }

        const updatedCarrier = await Carrier.findOneAndUpdate({_id: carrierId}, {
            ...filteredData
        },{
            new: true,
            runValidators: true
        })

        return updatedCarrier
    }catch(error){
        throw error
    }
}

const verifyLogin = async (email, password) => {
    try{
        const carrier = await Carrier.findByCredentials(email, password)

        return carrier
    }catch(error){
        throw error
    }
}

const addToken = async (id, token) => {
    try{
        const editedCarrier = await Carrier.findByIdAndUpdate(id,{
            $push:{
                tokens: token
            }
        })

        return editedCarrier
    }catch(error){
        throw error
    }
}

const deleteToken = async (id, token) => {
    try{
        await Carrier.findByIdAndUpdate(id,{
            $pull:{
                tokens: token
            }
        })

        return 
    }catch(error){
        throw error
    }
}

const uploadAvatar = async (file, carrierId) => {
    try{
        const carrier = await findById(carrierId)

        if(!file){
            throw new BadRequestException(`require file.`)
        }

        if(!carrier){
            throw new BadRequestException(`carrier id ${carrierId} not found.`)
        }

        if(carrier.avatar){
            await minioClient.removeObject(bucket, carrier.avatar)
            carrier.avatar = ''
        }

        const metadata = {
            'Content-type': file.mimetype,
        }

        const buffer = await sharp(file.buffer).resize({width:250,height:250}).toBuffer()

        const extArray = file.mimetype.split("/")
        const extension = extArray[extArray.length - 1]
        const fileName = `${uuidv4()}.${extension}`
        
        await minioClient.putObject(bucket, fileName, buffer, metadata)

        await Carrier.findByIdAndUpdate(carrier._id,{
            avatar: fileName
        })

        return fileName
    }catch(error){
        throw error
    }
}

const getAvatar = async (carrierId) => {
    try{
        const carrier = await findById(carrierId)

        if(!carrier){
            throw new BadRequestException(`carrier id ${carrierId} not found.`)
        }

        if(!carrier.avatar){
            throw new NotFoundException(`carrier avatar not found.`)
        }

        const dataStream = await minioClient.getObject(bucket, carrier.avatar)

        return dataStream
    }catch(error){
        if(error.code === 'NoSuchKey'){
            throw new InternalExpection(`${carrierId} avatar not found.`)
        }else{
            throw error
        }
    }
}

const checkOrder = async (carrierId, orderId) => {
    try{
        const order = await Order.findOne({
            _id: orderId,
            carrierId
        })

        if(!order){
            throw new BadRequestException('Order not found on your carrierId.')
        }

        return order
    }catch(error){
        throw error
    }
}

const checkItemDetail = async (carrierId, itemDetailId) => {
    try{

        const itemDetail = await ItemDetail.findById(itemDetailId).select('itemId').populate({
            path: 'itemId',
            select:['orderId'],
            populate:{
                path: 'orderId',
                select: ['_id'],
                model: 'Order',
                match: { carrierId }
            }
        }).exec()

        if(!itemDetail){
            throw new NotFoundException(`itemDetail not found.`)
        }else if(itemDetail.itemId.orderId === null){
            throw new BadRequestException('carrierId and itemDetailId not match.')
        }

        return itemDetail
    }catch(error){
        throw error
    }
}

module.exports = {
    findById,
    createCarrier,
    updatecarrier,
    verifyLogin,
    addToken,
    deleteToken,
    uploadAvatar,
    getAvatar,
    checkOrder,
    checkItemDetail
}