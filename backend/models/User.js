const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //package qui améliore les messages d'erreur lors de l'enregistrement de données uniques

//schema de données
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, //pour que 2 utilisateurs n'utilisent pas le même mail
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); //on rajoute le validateur comme plugin à notre schema

module.exports = mongoose.model('User', userSchema);