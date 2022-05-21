const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')
const InternalExpection = require('../exception/Internal.expection')

const Buyer = require('../model/buyer.model.js')

const minioClient = require('../db/minio.db.js')

const bucket = process.env.MINIO_BUCKET_AVATAR_IMAGE

const findById = async (id) => {
    try{
        const buyer = await Buyer.findById(id)

        if(!buyer){
            throw new NotFoundException(`Buyer id: ${id} not found.`)
        }

        return buyer
    }catch(error){
        throw error
    }
}

const createBuyer = async (data)  => {
    try{
        const requireField = ['cid', 'title', 'fname', 'lname', 'email', 'password', 'dob', 'telNumber']
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

        const newBuyer = new Buyer({
            ...data
        })

        await newBuyer.save()

        return newBuyer
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

const updateBuyer = async (data, buyerId) => {
    try{
        const buyer = await findById(buyerId)

        const updateField = ['title', 'fname', 'lname', 'password', 'telNumber', 'dob', 'telNumber', 'address', 'workAddress']

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
            buyer.password = filteredData.password
            await buyer.save()
            delete filteredData.password
        }

        const updatedBuyer = await Buyer.findOneAndUpdate({_id: buyerId}, {
            ...filteredData
        },{
            new: true,
            runValidators: true
        })

        return updatedBuyer
    }catch(error){
        throw error
    }
}

const verifyLogin = async (email, password) => {
    try{
        const buyer = await Buyer.findByCredentials(email, password)

        return buyer
    }catch(error){
        throw error
    }
}

const addToken = async (id, token) => {
    try{
        const editedBuyer = await Buyer.findByIdAndUpdate(id,{
            $push:{
                tokens: token
            }
        })

        return editedBuyer
    }catch(error){
        throw error
    }
}

const uploadAvatar = async (file, buyerId) => {
    try{
        const buyer = await findById(buyerId)

        if(!file){
            throw new BadRequestException(`require file.`)
        }

        if(!buyer){
            throw new BadRequestException(`Buyer id ${buyerId} not found.`)
        }

        if(buyer.avatar){
            await minioClient.removeObject(bucket, buyer.avatar)
            buyer.avatar = ''
        }

        const metadata = {
            'Content-type': file.mimetype,
        }

        const buffer = await sharp(file.buffer).resize({width:250,height:250}).toBuffer()

        const extArray = file.mimetype.split("/")
        const extension = extArray[extArray.length - 1]
        const fileName = `${uuidv4()}.${extension}`
        
        await minioClient.putObject(bucket, fileName, buffer, metadata)

        await Buyer.findByIdAndUpdate(buyer._id,{
            avatar: fileName
        })

        return fileName
    }catch(error){
        throw error
    }
}

const getAvatar = async (buyerId) => {
    try{
        const buyer = await findById(buyerId)

        if(!buyer){
            throw new BadRequestException(`Buyer id ${buyerId} not found.`)
        }

        if(!buyer.avatar){
            throw new NotFoundException(`Buyer avatar not found.`)
        }

        const dataStream = await minioClient.getObject(bucket, buyer.avatar)

        return dataStream
    }catch(error){
        if(error.code === 'NoSuchKey'){
            throw new InternalExpection(`${buyerId} avatar not found.`)
        }else{
            throw error
        }
    }
}

const deleteToken = async (id, token) => {
    try{
        await Buyer.findByIdAndUpdate(id,{
            $pull:{
                tokens: token
            }
        })

        return 
    }catch(error){
        throw error
    }
}

module.exports = {
    findById,
    createBuyer,
    updateBuyer,
    verifyLogin,
    addToken,
    uploadAvatar,
    getAvatar,
    deleteToken
}