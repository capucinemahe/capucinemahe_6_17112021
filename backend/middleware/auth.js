const jwt = require('jsonwebtoken'); //on a besoin de notre package jsonwebtoken pr vérifier les tokens

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //on récupère le 2eme element du tableau, le token donc
        const decodedToken = jwt.verify(token, `${process.env.TOKEN}`); //utilise le package jsonwebtoken et la fonction verify - décoder le token
        const userId = decodedToken.userId;
        //si jms on a un userid dans le corps de la req et qu'il est different du userid
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable'; //on retourne une erreur
        } else {
            req.user = decodedToken;
            next();
        }
    } catch {
        res.status(401).json({ error: new Error('Requête invalide !')
        });
    }
};