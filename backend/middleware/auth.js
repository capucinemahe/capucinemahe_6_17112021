//middleware d'authentification

const jwt = require('jsonwebtoken'); //package qui sert à vérifier les tokens

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //on récupère le 2eme element du tableau, le token donc
        const decodedToken = jwt.verify(token, `${process.env.TOKEN}`); //utilise la fonction verify - décoder le token
        const userId = decodedToken.userId;

        //véirfie si l'userid de la req est different du userid de la BD
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable';
        } else {
            req.user = decodedToken;
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Requête invalide !')
        });
    }
};