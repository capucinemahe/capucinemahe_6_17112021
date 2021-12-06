//middleware d'authentification

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //on récupère le token, 2eme element du tableau
        const decodedToken = jwt.verify(token, `${process.env.TOKEN}`); //fonction verify - décoder le token pour le comparer à mon mot secret+userId
        const userId = decodedToken.userId; //j'obtiens le userId du token qui a été généré

        //encoder = transformer en code secret, qui sera toujours le même 

        req.auth = { userId }; //je stocke mon userId dans l'objet req.auth
        //on assigne la valeur de la variable userId à la clé userId de l'objet auth

        if (req.body.userId && req.body.userId !== userId) {
            throw 'User Id non valable';
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Requête invalide !')
        });
    }
};



