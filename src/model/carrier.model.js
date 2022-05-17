const mongoose = require('../db/mongoose.db.js')

const BadRequestException = require('../exception/BadRequest.exception.js')

const validator = require('validator')
const bcrypt = require('bcryptjs')

const carrierSchema = new mongoose.Schema({
    cid:{
        type: String,
        unique: true,
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
        unique: true,
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
            }else if(!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/)){
                throw new BadRequestException('Password must be 6-15 characters and at least one uppercase letter, one lowercase letter, one number and one special character.')
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
    tokens:{
        type: [String]
    },
    avatar:{
        type: String
    },
    rating:{
        type: Number,
        max: 5,
        min: 0
    },
    address:{
        type: String
    }
},{
    versionKey: false
})

carrierSchema.methods.toJSON = function (){
    const carrier = this
    const carrierObject = carrier.toObject()

    delete carrierObject.password

    delete carrierObject.tokens

    return carrierObject
}

carrierSchema.pre('save', async function (next){
    try{
        const carrier = this

        if(carrier.isModified('password')){
            carrier.password = await bcrypt.hash(carrier.password, 8)
        }
    
        next()
    }catch(error){
        throw error
    }
})

carrierSchema.statics.findByCredentials = async (email, password) => {
    try{
        const carrier = await  Carrier.findOne({ email })

        if(!carrier){
            throw new BadRequestException('The email or password is incorrect')
        }

        const isMatch = await bcrypt.compare(password, carrier.password)

        if(!isMatch){
            throw new BadRequestException('The email or password is incorrect')
        }

        return carrier
    }catch(error){
        throw error
    }
}

const Carrier = mongoose.model('carrier', carrierSchema)

module.exports = Carrier