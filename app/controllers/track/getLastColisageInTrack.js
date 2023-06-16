const Box = require('../../models/box');
const ProducteurDechets = require('../../models/producteur_dechets');
const Track = require('../../models/track');

module.exports = class GetLastColisageInTrack {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.get('/track/getLastColisageInTrack', async (req, res) => {
            try {
                res.setHeader("Access-Control-Allow-Origin", "*");

                if (!req.query.id_box || !req.query.id_producteur_dechet) {
                    return res.status(400).json({ message: "Id_box required." });
                }

                const lastColisageIntrack = await Track.findOne({
                    where: {
                        id_box: req.query.id_box,
                        id_producteur_dechet: req.query.id_producteur_dechet,
                        id_statut_track: 4
                    },
                    order: [['date_heure', 'DESC']],
                })

                return res.send(lastColisageIntrack)

            } catch (error) {
                return res.status(500).json({ message: error.message || "Une erreur s'est produite lors de la création de la track." });
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
