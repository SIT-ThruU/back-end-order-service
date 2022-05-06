const jwt = require('jsonwebtoken')

const NotFoundException = require('../exception/NotFound.exception')
const UnAuthorizationException = require('../exception/UnAuthorization.exception.js')

const Buyer = require('../model/buyer.model')

const verifyAuthAT = async function (req, res, next){
    try{
        const invalidTokenError = new UnAuthorizationException('Please authenticate or get a new access token.')

        if(!req.header('Authorization')){
            throw invalidTokenError
        }

        const token = req.header('Authorization').replace('Bearer ','')

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_AT)

        if(!decodedPayload){
            throw invalidTokenError
        }
    
        const buyer = await Buyer.findById(decodedPayload.data)

        if(!buyer){
            throw new NotFoundException('Invalid token.')
        }

        req.buyer = buyer
        req.token = token

        next()
    }catch(error){
        next(error)
    }
}

const verifyAuthRT = async function (req, res, next){
    try{
        const invalidTokenError = new UnAuthorizationException('Please authenticate.')

        if(!req.header('Authorization')){
            throw invalidTokenError
        }

        const token = req.header('Authorization').replace('Bearer ','')

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_RT)

        if(!decodedPayload){
            throw invalidTokenError
        }
    
        const buyer = await Buyer.findOne({
            _id: decodedPayload.data,
            tokens: token
        })

        if(!buyer){
            throw new NotFoundException('Invalid token.')
        }

        req.buyer = buyer
        req.token = token

        next()
    }catch(error){
        next(error)
    }
}

module.exports = {
    verifyAuthAT,
    verifyAuthRT
}