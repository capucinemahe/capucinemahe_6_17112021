//configuration de multer
//est un middleware node.js, principalement utilisé pour télécharger des fichiers
const multer = require('multer');

//objet dictionnaire - sert pour l'extension du fichier
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => { //va expliquer à multer quel nom de fichier utiliser
        const name = file.originalname.split(' ').join('_');

        const extension = MIME_TYPES[file.mimetype]; //extension du fichier
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image'); //single pour fichier unique


