const mongoose = require('../db/mongoose.db.js')
const validator = require('validator')

const BadRequestException = require('../exception/BadRequest.exception.js')

const BuyerSchema = new mongoose.Schema({
    cid:{
        type: String,
        required: true,
        minLength: 13,
        maxLength: 13
    },
    title:{
        type: String,
        required: true
    },
    fname:{
        type: String,
        required: true,
        trim: true
    },
    lname:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new BadRequestException('Email is invalid.')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        maxLength: 15,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new BadRequestException('Password cannot contain "password".')
            }
        }
    },
    dob:{
        type: Date,
        required: true,
        validate(value){
            const today = new Date()
            const age = today.getFullYear() - value.getFullYear()
            const m = today.getMonth() - value.getMonth()

            if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
                age--
            } 

            if(age < 18){
                throw new BadRequestException('Should be at least 18 years old.')
            }
        }
    },
    telNumber:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isMobilePhone(value,'th-TH')){
                throw new BadRequestException('Phone number is invalid.')
            }
        }
    },
},{
    versionKey: false
})

const Buyer = mongoose.model('Buyer', BuyerSchema)

module.exports = Buyer