var monk = require('monk');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
/*
user   :{
    email   : String,
    password : String
}
*/

// methods

module.exports = {
    // generating a hash
    function generatehash(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    function isValidPassword(password) {
        return bcrypt.compareSync(password, this.user.password);
    }
};