//on a besoin d'express pr creer un routeur, que l'on déclare en dessous
const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

//le controleur pr associer les fonctions aux différentes routes
const userCtrl = require('../controllers/user');

//on crée 2 routes post 
router.post('/signup', [body('email').isEmail()], userCtrl.signup); //valide le bon format d'email
router.post('/login', userCtrl.login);

module.exports = router; //on exporte le routeur, et on l'importe dans app.js