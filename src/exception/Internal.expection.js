module.exports = class InternalExpection {
    constructor(message){
        this.message = message
        this.status = 500
    }
}