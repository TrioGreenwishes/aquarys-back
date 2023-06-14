const Comptage = require('../../models/comptage');
const Produits = require('../../models/produits');
const ProducteurDechet = require('../../models/producteur_dechets')
const Track = require('../../models/track');
const xl = require('excel4node');
const { signedCookie } = require('cookie-parser');

module.exports = class GetBonDeLivraisonController {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.post('/track/bon-de-livraison', async (req, res) => {
            try {
                res.setHeader("Access-Control-Allow-Origin", "*");

                if (!req.body.boxes || !req.body.id_producteur_dechet || !req.body.id_zone_lavage) {
                    return res.status(400).json({ message: 'Information missing' })
                }

                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                let todaysDate = new Date().toLocaleDateString('fr-FR', dateOptions);

                const prodDechet = await ProducteurDechet.findOne({ where: { id: req.body.id_producteur_dechet } })

                if (!prodDechet) {
                    return res.status(400).json({ message: 'Le client sélectionné n\'a pas été trouvé dans la base de données.' })
                }

                const boxes = req.body.boxes

                let infoTrack = []

                for (let i = 0; i < boxes.length; i++) {
                    let comptageInTrackInfo = await Track.findOne({
                        where: {
                            id_box: boxes[i],
                            id_producteur_dechet: req.body.id_producteur_dechet,
                            id_statut_track: 2
                        },
                        order: [['date_heure', 'DESC']],
                    })

                    if (comptageInTrackInfo) {
                        infoTrack.push(comptageInTrackInfo)
                    }
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
                        id_statut_track: 5,
                    },
                    order: [['numero_bon', 'DESC']],
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

                ws.cell(1, 1).string('BON DE LIVRAISON').style(headerStyle)
                ws.cell(2, 1).string('Client')
                ws.cell(2, 2).string(prodDechet.nom)
                ws.cell(3, 1).string('Numero du bon')
                ws.cell(3, 2).number(newNumeroBon)
                ws.cell(4, 1).string("Date du bon")
                ws.cell(4, 2).string(todaysDate)

                ws.cell(8, 1).string('CASSES PROPES CONCERNES').style(headerStyle)

                let cellToInsertBox = 14

                for (let i = 0; i < boxes.length; i++) {
                    ws.cell(i + 9, 1).string('Caisse № ' + boxes[i])

                    ws.cell(cellToInsertBox, 1).string('DETAIL CAISSE № ' + boxes[i]).style(headerStyle)
                    ws.cell(cellToInsertBox + 2, 1).string('TYPE DE CONTENTANT').style(headerStyle)
                    ws.cell(cellToInsertBox + 2, 2).string('QTE').style(headerStyle)

                    let lastCellInserted = cellToInsertBox + 2

                    for (let j = 0; j < infoTrack.length; j++) {

                        if (infoTrack[j].id_box === boxes[i]) {
                            const infoComptage = await Comptage.findAll({ where: { id_track: infoTrack[j].id } })

                            let cellToInsertProduct = lastCellInserted + 1

                            for (let k = 0; k < infoComptage.length; k++) {
                                const infoProduct = await Produits.findByPk(infoComptage[k].id_produit)

                                if (infoProduct && infoComptage[k].nb_reel) {
                                    ws.cell(cellToInsertProduct + k, 1).string(infoProduct.nom)
                                    ws.cell(cellToInsertProduct + k, 2).number(infoComptage[k].nb_reel)
                                } else {
                                    ws.cell(cellToInsertProduct + k, 1).string('SANS COMPTAGE')
                                    ws.cell(cellToInsertProduct + k, 2).string('SANS COMPTAGE')
                                }

                                if (k === infoComptage.length - 1) {
                                    ws.cell(cellToInsertProduct + k + 4, 1).string('SIGNATURE CLIENT').style(headerStyle)
                                }
                            }

                            lastCellInserted = lastCellInserted + 2

                        }
                    }

                    cellToInsertBox = lastCellInserted + 3

                }

                wb.write((todaysDate + ' ' + prodDechet.nom + '.xlsx'), res);

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
