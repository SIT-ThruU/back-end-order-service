const jwt = require('jsonwebtoken')

const NotFoundException = require('../exception/NotFound.exception')
const UnAuthorizationException = require('../exception/UnAuthorization.exception.js')

const Carrier = require('../model/carrier.model.js')

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
    
        const carrier = await Carrier.findById(decodedPayload.data)

        if(!carrier){
            throw new NotFoundException('Invalid token.')
        }

        req.carrier = carrier
        req.token = token

        next()
    }catch(error){
        if(error.message === 'invalid signature' || error.message === 'jwt expired'){
            next(new UnAuthorizationException(error.message))
        }else{
            next(error)
        }
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
    
        const carrier = await Carrier.findOne({
            _id: decodedPayload.data,
            tokens: token
        })

        if(!carrier){
            throw new NotFoundException('Invalid token.')
        }

        req.carrier = carrier
        req.token = token

        next()
    }catch(error){
        if(error.message === 'invalid signature' || error.message === 'jwt expired'){
            next(new UnAuthorizationException(error.message))
        }else{
            next(error)
        }
    }
}

module.exports = {
    verifyAuthAT,
    verifyAuthRT
}