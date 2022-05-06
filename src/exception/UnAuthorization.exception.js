module.exports = class UnAuthorizationException {
    constructor(message){
        this.message = message;
        this.status = 401;
    }
}