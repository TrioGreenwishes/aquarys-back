const Box = require('../../models/box');
const Comptage = require('../../models/comptage');
const Track = require('../../models/track');
const xl = require('excel4node');
const { response } = require('express');

module.exports = class GetBonDeLivraisonController {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.get('/track/bon-de-livraison', async (req, res) => {
            try {
                res.setHeader("Access-Control-Allow-Origin", "*");

                if (!req.body.boxes || !req.body.id_producteur_dechet) {
                    return res.status(400).json({ message: 'Information missing' })
                }

                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                let todaysDate = new Date().toLocaleDateString('fr-FR', dateOptions);

                const boxes = req.body.boxes
                let infoTrack = []

                for (let i = 0; i < boxes.length; i++) {
                    let boxInColisage = await Track.findAll({ where: { id_box: boxes[i], id_producteur_dechet: req.body.id_producteur_dechet, id_statut_track: 2 }, order: [['date_heure', 'DESC']], limit: 1 })
                    infoTrack.push(boxInColisage[0])
                }

                let idsTrack = []

                for (let i = 0; i < infoTrack.length; i++) {
                    idsTrack.push(infoTrack[i].id)
                }
                
                const infoComptage = await Comptage.findAll({ where: { id_track: idsTrack } })

                const lastTrackWithNumeroBon = await Track.findOne({where: {id_producteur_dechet: req.body.id_producteur_dechet, numero_bon: !null}, order: [['date_heure', 'DESC']], limit: 1 })

                let wb = new xl.Workbook();
                let ws = wb.addWorksheet('Bon de livraison');

                const headerStyle = wb.createStyle({
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        bgColor: '#3e6334',
                        fgColor: '#3e6334',
                    },
                    font: {
                        size: 12,
                        name: 'Calibri',
                        color: 'FFFFFFFF',
                        bold: true
                    },
                })

                ws.cell(1, 1).string('Bon de livraison').style(headerStyle)
                ws.cell(1, 2).string('Client').style(headerStyle)


                wb.write((todaysDate + '- all data.xlsx'), res);

            } catch (error) {
                return res.status(500).json({ message: error.message || "Une erreur s'est produite lors de generer le bon de livraison." });
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
