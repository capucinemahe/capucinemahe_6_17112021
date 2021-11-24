const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');

router.post('/', auth, multer, saucesCtrl.createSauce); //bien mettre multer après 'auth'
router.put('/:id', auth, multer, saucesCtrl.modifySauce); //on applique la fonction à la route, on ne l'appelle pas
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/:id/like', auth, saucesCtrl.likeSauce);

module.exports = router;

//routes pour la partie sauces de l'appli