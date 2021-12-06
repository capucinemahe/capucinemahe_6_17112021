//contient la logique des routes des users

const express = require('express');
const router = express.Router();

const { body } = require('express-validator'); //verifie le format des inputs au sign up

const userCtrl = require('../controllers/user');

router.post('/signup', [body('email').isEmail()], userCtrl.signup); //valide le bon format d'email
router.post('/login', userCtrl.login);

module.exports = router; //on exporte le routeur, et on l'importe dans app.js