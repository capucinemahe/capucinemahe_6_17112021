//logique schema user

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passwordValidator = require('password-validator');

const schemaPV = new passwordValidator();
schemaPV
    .is().min(8)
    .is().max(35)
    .has().uppercase()     //doit avoir une majuscule
    .has().lowercase()     //doit avoir des minuscules
    .has().digits(2)       //doit avoir au moins 2 chiffres                   
    .has().not().spaces()  //ne doit pas contenir d'espace                    
    .is().not().oneOf(['Passw0rd', 'Password123']); //ne peut pas contenir ces mdp

//la fonction sign up crypte le mot de passe, et va prendre ce mdp et créer un new user
exports.signup = (req, res, next) => {
    if (schemaPV.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10) //on hash le mot de passe - 10 tours = cb de fois on exécute l'algo de hashage
            .then(hash => {
                const user = new User({
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
    User.findOne({ email: req.body.email }) //pour trouver un seul utilisateur de la base de donnees avec adresse email unique
        .then(user => {
            if (!user) { //si on a pas trouvé l'utilisateur
                return res.status(401).json({ error: `Utilisateur non trouvé: ${req.body.email} !` })
            }
            bcrypt.compare(req.body.password, user.password)
                //on utilise le package bcrypt pr comparer le mdp envoyé avec la requete avec le hash enregistré dans la BD
                .then(valid => { //ici on reçoit un boolean
                    if (!valid) { //si on recoit false - l'user a rentré le mauvais mdp
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //on reçoit true
                    res.status(200).json({ //renvoi un objet json qui contient :
                        userId: user._id,
                        token: jwt.sign( //données que l'on veut encoder dans l'objet
                            { userId: user._id },
                            `${process.env.TOKEN}`,
                            { expiresIn: '24h' })
                    });
                })
        })
        .catch(error => res.status(500).json({ error })); //si erreur serveur
};