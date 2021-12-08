//middleware d'authentification
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //on récupère le token
        const decodedToken = jwt.verify(token, `${process.env.TOKEN}`); //on décode le token
        const userId = decodedToken.userId; //on prend le userId du token décodé
        
        //si on a un userId mais qu'il est différent de celui stocké dans le token
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User Id non valable';
        } else {
            req.auth = decodedToken; //je stock le token dans l'objet req.auth
            next();
        }
    } catch {
        res.status(401).json({ message: 'Requête invalide !'})};
    };