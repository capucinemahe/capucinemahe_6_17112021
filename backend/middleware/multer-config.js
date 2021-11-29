const multer = require('multer');

//objet dictionnaire - sert pour l'extension du fichier
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//configuration de multer
const storage = multer.diskStorage({ //on enregistre sur le disk
    destination: (req, file, callback) => { //1er element qui dit ou enregistrer les fichiers
        callback(null, 'images'); //null pr dire qu'il n'y a pas d'erreur
    },
    filename: (req, file, callback) => { //va expliquer à multer quel nom de fichier utiliser
        const name = file.originalname.split(' ').join('_'); //on génère le nouveau nom du fichier
        //methode split pour remplacer les white spaces par des underscores
        const extension = MIME_TYPES[file.mimetype]; //extension du fichier
        callback(null, name + Date.now() + '.' + extension);
    } //pour que 2 fichiers n'aient pas le meme nom
});

module.exports = multer({ storage: storage }).single('image'); //single pour fichier unique