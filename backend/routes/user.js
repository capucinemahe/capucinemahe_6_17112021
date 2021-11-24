const express = require('express'); //on a besoin d'express pr creer un routeur, que l'on déclare en dessous
const router = express.Router();

const userCtrl = require('../controllers/user'); //le controleur pr associer les fonctions aux différentes routes


//on crée 2 routes post 
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router; //on exporte le routeur, et on l'importe dans app.js