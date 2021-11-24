const mongoose = require('mongoose');

//on créé un schéma de données qui contient les champs souhaités pour chaque Sauce, indique leur type ainsi que leur caractère (obligatoire ou non)
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: Array, default : [] },
    usersDisliked : { type: Array, default : [] },
});

//pas besoin de mettre un champ pour l'Id puisqu'il est automatiquement généré par Mongoose
//on pourra utiliser ce model pour intéragir avec la base de données mongodb
module.exports = mongoose.model('Sauce', sauceSchema);