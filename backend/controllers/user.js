const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


//2 middlewares

//la fonction sign up qui crypte le mot de passe, et va prendre ce mdp et créer un new user etc
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) //on hash le mot de passe - 10 tours = cb de fois on exécute l'algo de hashage
        .then(hash => { //on créé un new user avec le modèle mongoose
            const user = new User({
                email: req.body.email, //adresse fournie dans le corps de la requete
                password: hash //mot de passe crypté 
            });
            user.save() //pour enregistrer dans la base de données
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) //pour trouver un seul utilisateur de la base de donnees avec adresse email unique
    //dans le then on cherche si on a trouvé le user ou pas
        .then(user => {
            if (!user) { //si on a pas trouvé le user
                return res.status(401).json({ error });
            }
            bcrypt.compare(req.body.password, user.password) //on utilise le package bcrypt pr comparer le mdp envoyé avec la requete avec le hash enregistré dans document user
                .then(valid => { //ici on reçoit un boolean
                    if (!valid) { //si on recoit false - l'user a rentré le mauvais mdp
                        return res.status(401).json({ error });
                    }
                    //on reçoit true
                    res.status(200).json({ //renvoi un objet json qui contient :
                        userId: user._id,
                        token: jwt.sign( //données que l'on veut encoder dans l'objet
                            { userId: user._id },
                            `${process.env.TOKEN}`,
                            { expiresIn: '24h' } //expiration pr le token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); //si erreur serveur, de connexion, pb lié à mongoDB
        })
        .catch(error => res.status(500).json({ error })); //si erreur serveur, pb lié à mongoDB
};