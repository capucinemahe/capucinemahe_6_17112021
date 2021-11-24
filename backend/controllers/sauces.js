//ici on veut la logique métier
const Sauce = require('../models/Sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');
//file system = système de fichiers. donne accès aux fonctions qui nous permettent de modifier le système de fichiers
//y compris aux fonctions permettant de supprimer les fichiers

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //pour extraire l'objet json de thing
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //on genère l'url de l'image de facon dynamique
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, `${process.env.TOKEN}`);
    const userId = decodedToken.userId;
    //fait en sorte de verifier que l'utilisateur qui supprime soit celui qui a créé la sauce et pas un autre

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === userId) {

                const sauceObject = req.file ? //si il existe, on aura un type d'objet
                    {
                        ...JSON.parse(req.body.sauce), //on récupère les infos sur l'objet qui sont dans cette partie de la requete
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    } : { ...req.body }; //sinon on aura ce type d'objet : copie de req.body
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
            } else {
                res.status(401).json({ message: "vous n'êtes pas autorisé" });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

//on trouve l'objet dans la base de donnees - quand on le trouve on extrait le nom du ficheir à suppr
//et quand le fichier ets supprimé, on supprime l'objet dans la base
exports.deleteSauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, `${process.env.TOKEN}`);
    const userId = decodedToken.userId;
    //fait en sorte de verifier que l'utilisateur qui supprime soit celui qui a créé la sauce et pas un autre
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === userId) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { //unlink pour supprimer un fichier
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            } else {
                res.status(401).json({ message: "vous n'êtes pas autorisé" });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //pour trouver une sauce en particulier
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find() //methode find pour avoir la liste complète des sauces
        .then(sauces => res.status(200).json(sauces)) //on récupère toutes les sauces retournées par la base et l'on envoie en réponse
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;

    switch (like) {
        case 1:
            Sauce.findOne({ _id: req.params.id }) //sauce sur laquelle l'user click
                .then(sauce => {
                    if (sauce.usersDisliked.includes(userId) || sauce.usersLiked.includes(userId)) { //je vérifie si l'userId est déja présent dans un des 2 tableaux
                        throw "vous avez déja liké cette sauce"
                    } else {
                        Sauce.updateOne({ _id: req.params.id }, //sinon, j'ajoute un like à cette sauce et je push l'userId dans le tableau
                            {
                                $inc: { likes: 1 },
                                $push: { usersLiked: userId },
                            })
                            .then(() => res.status(200).json({ message: "L'utilisateur a liké cette sauce" }))
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break; //fin de la logique du cas 1

        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    if (sauce.usersDisliked.includes(userId)) {

                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId }, //j'enlève l'userId du tableau usersDisliked
                            })
                            .then(() => res.status(200).json({ message: "L'utilisateur a enlevé son dislike à cette sauce" }))


                    } else if (sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: userId },
                            })
                            .then(() => res.status(200).json({ message: "L'utilisateur a enlevé son like à cette sauce" }))
                    }

                })
                .catch(error => res.status(400).json({ error }));
            break;

        case -1:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    if (sauce.usersDisliked.includes(userId) || sauce.usersLiked.includes(userId)) {
                        throw "vous avez déja disliké cette sauce"
                    } else {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: 1 },
                                $push: { usersDisliked: userId },
                            })
                            .then(() => res.status(200).json({ message: "L'utilisateur a disliké cette sauce" }))
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break;

    }
};