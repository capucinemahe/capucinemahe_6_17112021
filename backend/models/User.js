const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //on rajoute le validateur comme plugin à notre schema

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, //pour que 2 utilisateurs n'utilisent pas le même e-mail, nous utiliserons le mot clé unique pour l'attribut email
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); //on rajoute le validateur comme plugin à notre schema

module.exports = mongoose.model('User', userSchema);