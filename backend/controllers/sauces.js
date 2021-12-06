//logique métier des sauces

const Sauce = require('../models/Sauce');
const fs = require('fs');
//file system = système de fichiers. donne accès aux fonctions qui nous permettent de modifier ou supprimer le système de fichiers

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //pour extraire l'objet json de sauce
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

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.auth.userId) {
                const sauceObject = req.file ? //si il existe, on aura un type d'objet
                    {
                        ...JSON.parse(req.body.sauce), //on récupère les infos sur l'objet qui sont dans cette partie de la requete
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    } : { ...req.body }; //sinon on aura ce type d'objet : copie de req.body
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) //on utilise la méthode updateOne pour modifier la sauce dans la BD
                    //1er argument pr savoir quel objet on midifie - 2eme argument : nvelle version de l'objet
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
            } else {
                res.status(403).json({ message: "vous n'êtes pas autorisé" });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

//on trouve l'objet dans la base de donnees - quand on le trouve on extrait le nom du fichier à suppr
//et quand le fichier est supprimé, on supprime l'objet dans la base
exports.deleteSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.auth.userId) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { //unlink pour supprimer un fichier
                    Sauce.deleteOne({ _id: req.params.id }) //prend l'objet de comparaison comme argument 
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            } else {
                res.status(403).json({ message: "vous n'êtes pas autorisé" });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

//pour avoir une sauce en particulier
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

//methode find pour avoir la liste complète des sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;

    switch (like) {
        case 1: //l'user veut liker la sauce
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

        case 0: //l'user veut enlever son like ou dislike
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