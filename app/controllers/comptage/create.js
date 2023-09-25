const Comptage = require('../../models/comptage');
const Produits = require('../../models/produits');
const Track = require('../../models/track');

module.exports = class CreateComptageController {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.post('/comptage/post', async (req, res) => {
            try {
                const track = await Track.findByPk(req.body.id_track)
                const produit = await Produits.findByPk(req.body.id_produit)

                res.setHeader("Access-Control-Allow-Origin", "*");

                if (!req.body.id_track) {
                    return res.status(400).json({ message: "Les champs ne peuvent pas être vides." });
                };

                if(!track) {
                    return res.status(400).json({ message: "L'id TRACK ou l'id PRODUITS n'existe pas !'" });
                };

                if(!req.body.has_comptage){
                    req.body.has_comptage = 0;
                };

                await Comptage.create({
                    id_track: req.body.id_track,
                    id_produit: req.body.id_produit,
                    nb_reel: req.body.nb_reel,
                    has_comptage: req.body.has_comptage
                }).then(comptage => {
                    if (comptage) {
                        return res.status(200).json({ message: "La comptage a bien été créé." });
                    };
                });

            } catch (error) {
                return res.status(500).json({ message: error.message || "Une erreur s'est produite lors de la création du comptage." });
            }

        });
    }

    /**
     * Run
     */
    run() {
        this.middleware()
    }
}
