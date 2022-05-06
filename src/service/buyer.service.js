const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')

const Buyer = require('../model/buyer.model.js')

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
        }

        throw error
    }
}

const updateBuyer = async (data, buyerId) => {
    try{
        const buyer = await findById(buyerId)

        const updateField = ['title', 'fname', 'lname', 'password', 'telNumber']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        if(filteredData.password){
            buyer.password = filteredData.password
            await buyer.save()
            delete filteredData.password
        }

        const updatedBuyer = await Buyer.findOneAndUpdate({_id: buyerId}, {
            ...filteredData
        },{
            new: true
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

module.exports = {
    findById,
    createBuyer,
    updateBuyer,
    verifyLogin,
    addToken
}