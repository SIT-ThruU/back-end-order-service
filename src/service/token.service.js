const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Buyer = require('../model/buyer.model.js')

const { findById } = require('./buyer.service.js')

const generateRefreshToken = async (id) => {
    try{
        await findById(id)
    
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
        await findById(id)
    
        const token = jwt.sign({data: id}, process.env.JWT_SECRET_AT,{
            expiresIn: process.env.JWT_AT_EXPIRES_IN
        })
    
        return token
    }catch(error){
        throw error
    }
}

const deleteRefreshToken = async (id, token) => {
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
    generateRefreshToken,
    generateAccessToken,
    deleteRefreshToken
}