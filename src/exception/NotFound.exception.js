module.exports = class NotFoundException {
    constructor(message){
        this.message = message;
        this.status = 404;
    }
}