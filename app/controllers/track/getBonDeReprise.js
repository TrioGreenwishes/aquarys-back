const Comptage = require('../../models/comptage');
const Produits = require('../../models/produits');
const ProducteurDechet = require('../../models/producteur_dechets')
const Track = require('../../models/track');
const xl = require('excel4node');

module.exports = class GetBonDeRepriseController {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.get('/track/bon-de-reprise', async (req, res) => {
            try {
                res.setHeader("Access-Control-Allow-Origin", "*");
                
                if (!req.body.boxes || !req.body.id_producteur_dechet || !req.body.id_zone_lavage) {
                    return res.status(400).json({ message: 'Information missing' })
                }

                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                let todaysDate = new Date().toLocaleDateString('fr-FR', dateOptions);

                const prodDechetName = (await ProducteurDechet.findOne({ where: { id: req.body.id_producteur_dechet } })).nom

                const boxes = req.body.boxes

                let lastTrackWithNumeroBon = await Track.findOne({
                    where: {
                        id_producteur_dechet: req.body.id_producteur_dechet,
                        id_statut_track: 1,
                    },
                    order: [['numero_bon', 'DESC']],
                    limit: 1
                })

                let newNumeroBon = (lastTrackWithNumeroBon === null) ? 1 : (lastTrackWithNumeroBon.numero_bon + 1)

                const trackCreated = await Track.create({
                    id_box: null,
                    id_producteur_dechet: req.body.id_producteur_dechet,
                    id_zone_lavage: req.body.id_zone_lavage,
                    id_statut_track: 1,
                    numero_bon: newNumeroBon
                })

                if (!trackCreated) {
                    return res.status(400).json({ message: 'Track not created' })
                }

                let wb = new xl.Workbook();
                let ws = wb.addWorksheet('Bon de reprise');

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
                ws.cell(2, 1).string('Client')
                ws.cell(2, 2).string(prodDechetName)
                ws.cell(3, 1).string('Numero du bon')
                ws.cell(3, 2).number(newNumeroBon)
                ws.cell(4, 1).string("Date du bon")
                ws.cell(4, 2).string(todaysDate)

                ws.cell(10, 1).string('CASSES REÇUES').style(headerStyle)

                for (let i = 0; i < boxes.length; i++) {
                    ws.cell(i + 11, 1).string('Caisse № ' + boxes[i])
                }

                wb.write((todaysDate + ' ' + prodDechetName + '.xlsx'), res);

            } catch (error) {
                return res.status(400).json({ message: error.message || "Une erreur s'est produite lors de generer le bon de livraison." });
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
