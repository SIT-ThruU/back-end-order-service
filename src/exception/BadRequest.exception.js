module.exports = class BadRequestException {
    constructor(message){
        this.message = message;
        this.status = 400;
    }
}