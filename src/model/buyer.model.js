const mongoose = require('../db/mongoose.db.js')
const validator = require('validator')

const BadRequestException = require('../exception/BadRequest.exception.js')

const Buyer = mongoose.model('buyer',{
    cid:{
        type: String,
        require: true,
        minLength: 13,
        maxLength: 13
    },
    title:{
        type: String,
        require: true
    },
    fname:{
        type: String,
        require: true,
        trim: true
    },
    lname:{
        type: String,
        require: true,
        trim: true
    },
    email:{
        type: String,
        require: true,
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
        require: true,
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
        require: true,
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
        require: true,
        validate(value){
            if(!validator.isMobilePhone(value,'th-TH')){
                throw new BadRequestException('Phone number is invalid.')
            }
        }
    },
})

module.exports = Buyer