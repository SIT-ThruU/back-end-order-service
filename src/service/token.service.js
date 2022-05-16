const jwt = require('jsonwebtoken')
const Buyer = require('../model/buyer.model.js')

const generateRefreshToken = async (id) => {
    try{
    
        const token = jwt.sign({data: id}, process.env.JWT_SECRET_RT,{
            expiresIn: process.env.JWT_RT_EXPIRES_IN
        })
    
        return token
    }catch(error){
        throw error
    }
}

const generateAccessToken = async (id) => {
    try{
    
        const token = jwt.sign({data: id}, process.env.JWT_SECRET_AT,{
            expiresIn: process.env.JWT_AT_EXPIRES_IN
        })
    
        return token
    }catch(error){
        throw error
    }
}

module.exports = {
    generateRefreshToken,
    generateAccessToken
}