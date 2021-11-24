//on place l'application express
const express = require('express');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const path = require('path'); //donne accès au chemin de notre système de fichiers

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

require('dotenv').config();

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_MDP}@${process.env.MONGO_ACCESS}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

//middleware general - sera appliqué à toutes les routes - corrige l'erreur de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //accéder à l'API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
}); //permet a l'appli d'acceder à l'api

app.use('/images', express.static(path.join(__dirname, 'images')));
//middleware pr dire à notre app express de servir le dossier images quand on fera une requete à /images

app.use('/api/sauces', saucesRoutes); //on remets le début de la route et on utilise le routeur qui est exposé par saucesRoutes
app.use('/api/auth', userRoutes); //routes liées à l'authentification


module.exports = app;