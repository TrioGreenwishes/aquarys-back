const Comptage = require('../../models/comptage');
const Produits = require('../../models/produits');
const ProducteurDechet = require('../../models/producteur_dechets')
const Track = require('../../models/track');
const xl = require('excel4node');

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

                if (!req.body.boxes || !req.body.id_producteur_dechet || !req.body.id_zone_lavage) {
                    return res.status(400).json({ message: 'Information missing' })
                }

                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                let todaysDate = new Date().toLocaleDateString('fr-FR', dateOptions);

                const prodDechetName = (await ProducteurDechet.findOne({ where: { id: req.body.id_producteur_dechet } })).nom

                const boxes = req.body.boxes

                let infoTrack = []

                for (let i = 0; i < boxes.length; i++) {
                    let comptageInTrackInfo = await Track.findAll({
                        where: {
                            id_box: boxes[i],
                            id_producteur_dechet: req.body.id_producteur_dechet,
                            id_statut_track: 2
                        },
                        order: [['date_heure', 'DESC']],
                        limit: 1
                    })
                    infoTrack.push(comptageInTrackInfo[0])
                }

                let idsTrack = []

                for (let i = 0; i < infoTrack.length; i++) {
                    if (infoTrack[i]) {
                        idsTrack.push(infoTrack[i].id)
                    }
                }

                let lastTrackWithNumeroBon = await Track.findOne({
                    where: {
                        id_producteur_dechet: req.body.id_producteur_dechet,
                        numero_bon: !null
                    },
                    order: [['date_heure', 'DESC']],
                    limit: 1
                })

                let newNumeroBon = (lastTrackWithNumeroBon === null) ? 1 : (lastTrackWithNumeroBon.numero_bon + 1)

                const trackCreated = await Track.create({
                    id_box: null,
                    id_producteur_dechet: req.body.id_producteur_dechet,
                    id_zone_lavage: req.body.id_zone_lavage,
                    id_statut_track: 5,
                    numero_bon: newNumeroBon
                })

                if (!trackCreated) {
                    return res.status(400).json({ message: 'Track not created' })
                }

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
                ws.cell(2, 1).string('Client')
                ws.cell(2, 2).string(prodDechetName)
                ws.cell(3, 1).string('Numero du bon')
                ws.cell(3, 2).number(newNumeroBon)
                ws.cell(4, 1).string("Date du bon")
                ws.cell(4, 2).string(todaysDate)

                ws.cell(10, 1).string('CASSES PROPES CONCERNES').style(headerStyle)

                for (let i = 0; i < boxes.length; i++) {
                    ws.cell(i + 11, 1).string('Caisse № ' + boxes[i])

                    let workSheetForBox = wb.addWorksheet('CAISSE № ' + boxes[i]);

                    workSheetForBox.cell(1, 1).string('DETAIL DE CAISSE № ' + boxes[i]).style(headerStyle)

                    workSheetForBox.cell(3, 1).string('TYPE DE PRODUIT').style(headerStyle)
                    workSheetForBox.cell(3, 2).string('QTE').style(headerStyle)

                    for (let j = 0; j < idsTrack.length; j++) {
                        const infoComptage = await Comptage.findAll({ where: { id_track: idsTrack[j] } })

                        for (let k = 0; k < infoComptage.length; k++) {
                            const productsName = (await Produits.findByPk(infoComptage[k].id_produit)).nom
                            const productQTE = infoComptage[k].nb_reel

                            workSheetForBox.cell(k + 4, 1).string(productsName)
                            workSheetForBox.cell(k + 4, 2).number(productQTE)
                        }
                    }
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
