//logique métier des users

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passwordValidator = require('password-validator');

const schemaPV = new passwordValidator();
schemaPV
    .is().min(8)
    .is().max(35)
    .has().uppercase()   
    .has().lowercase()     
    .has().digits(2)                  
    .has().not().spaces()                   
    .is().not().oneOf(['Passw0rd', 'Password123']); //ne peut pas contenir ces mdp

//la fonction sign up crypte le mdp, et va prendre ce mdp et créer un new user
exports.signup = (req, res, next) => {
    if (schemaPV.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10) //on hash le mdp - 10 tours = cb de fois on exécute l'algo de hashage
            .then(hash => {
                const user = new User({ //on créé un utilisateur
                    email: req.body.email, //adresse fournie dans le corps de la requete
                    password: hash //mot de passe crypté
                });
                user.save() //pour enregistrer dans la base de données
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        res.status(401).json({ message: "mot de passe trop faible" }); //erreur retournée si le passwordValidator n'est pas validé
    }
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) //on cherche si l'email entré est déja présent dans la BD
        .then(user => {
            if (!user) { //si on a pas trouvé l'utilisateur correspondant à l'email de la req
                return res.status(401).json({ error: 'Utilisateur non trouvé' })
            }
            //si l'email correspond : 
            //on utilise le package bcrypt pr comparer le mdp envoyé avec la requete avec le hash enregistré dans la BD
            bcrypt.compare(req.body.password, user.password)
                .then(valid => { 
                    if (!valid) { //si on recoit false - l'user a rentré le mauvais mdp
                        return res.status(401).json({ message: 'Mot de passe incorrect !' });
                    }
                    //on reçoit true - le mot de passe est bon 
                    res.status(200).json({ //renvoi un objet json qui contient :
                        userId: user._id, 
                        token: jwt.sign( //fonction sign qui prend en arguments :
                            { userId: user._id }, //le payload
                            `${process.env.TOKEN}`, 
                            { expiresIn: '24h' }
                        )
                    });
                })
        })
        .catch(error => res.status(500).json({ error })); //si erreur serveur
};

