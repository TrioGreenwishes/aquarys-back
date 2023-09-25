const Colisage = require('../../models/colisage');
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
                    let colisageInTrackInfo = await Track.findOne({
                        where: {
                            id_box: boxes[i],
                            id_producteur_dechet: req.body.id_producteur_dechet,
                            id_statut_track: 4
                        },
                        order: [['date_heure', 'DESC']],
                    })

                    if (!colisageInTrackInfo) {
                        return res.status(400).json({ message: 'Box without colisage in track for this producteur dechets.' })
                    }

                    infoTrack.push(colisageInTrackInfo)
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

                for (let i = 0; i < boxes.length; i++) {

                    const trackCreated = await Track.create({
                        id_box: boxes[i],
                        id_producteur_dechet: req.body.id_producteur_dechet,
                        id_zone_lavage: req.body.id_zone_lavage,
                        id_statut_track: 5,
                        numero_bon: newNumeroBon
                    })

                    if (!trackCreated) {
                        return res.status(400).json({ message: 'Track not created' })
                    }
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
                    border: {
                        left: {
                            style: 'medium',
                            color: 'black',
                        },
                        right: {
                            style: 'medium',
                            color: 'black',
                        },
                        top: {
                            style: 'medium',
                            color: 'black',
                        },
                        bottom: {
                            style: 'medium',
                            color: 'black',
                        },
                        outline: false,
                    },
                })

                const informationCellStyle = wb.createStyle({
                    border: {
                        left: {
                            style: 'medium',
                            color: 'black',
                        },
                        right: {
                            style: 'medium',
                            color: 'black',
                        },
                        top: {
                            style: 'medium',
                            color: 'black',
                        },
                        bottom: {
                            style: 'medium',
                            color: 'black',
                        },
                        outline: false,
                    },
                })

                ws.column(1).setWidth(40);
                ws.column(2).setWidth(30);

                ws.cell(1, 1).string('BON DE LIVRAISON').style(headerStyle)
                ws.cell(1, 2).style(headerStyle)
                ws.cell(2, 1).string('Client').style(informationCellStyle)
                ws.cell(2, 2).string(prodDechet.nom).style(informationCellStyle)
                ws.cell(3, 1).string('Numero du bon').style(informationCellStyle)
                ws.cell(3, 2).number(newNumeroBon).style(informationCellStyle)
                ws.cell(4, 1).string("Date du bon").style(informationCellStyle)
                ws.cell(4, 2).string(todaysDate).style(informationCellStyle)

                ws.cell(8, 1).string('CASSES PROPES CONCERNES').style(headerStyle)

                let cellToInsertBox = 14

                for (let i = 0; i < boxes.length; i++) {
                    ws.cell(i + 9, 1).string('Caisse № ' + boxes[i]).style(informationCellStyle)

                    ws.cell(cellToInsertBox, 1).string('DETAIL CAISSE № ' + boxes[i]).style(headerStyle)
                    ws.cell(cellToInsertBox + 2, 1).string('TYPE DE CONTENTANT').style(headerStyle)
                    ws.cell(cellToInsertBox + 2, 2).string('QTE').style(headerStyle)

                    let lastCellInserted = cellToInsertBox + 2

                    for (let j = 0; j < infoTrack.length; j++) {

                        if (infoTrack[j].id_box === boxes[i]) {
                            const infoColisage = await Colisage.findAll({ where: { id_track: infoTrack[j].id } })

                            let cellToInsertProduct = lastCellInserted + 1

                            for (let k = 0; k < infoColisage.length; k++) {
                                const infoProduct = await Produits.findByPk(infoColisage[k].id_produit)

                                if (infoProduct && infoColisage[k].nb_add) {
                                    ws.cell(cellToInsertProduct + k, 1).string(infoProduct.nom).style(informationCellStyle)
                                    ws.cell(cellToInsertProduct + k, 2).number(infoColisage[k].nb_add).style(informationCellStyle)
                                } else {
                                    ws.cell(cellToInsertProduct + k, 1).string('SANS INFORMATION ENREGISTRE').style(informationCellStyle)
                                    ws.cell(cellToInsertProduct + k, 2).string('SANS INFORMATION ENREGISTRE').style(informationCellStyle)
                                }

                                if (k === infoColisage.length - 1) {
                                    ws.cell(cellToInsertProduct + k + 4, 1).string('SIGNATURE CLIENT').style(headerStyle)
                                    ws.cell(cellToInsertProduct + k + 4, 2).style(headerStyle)
                                    ws.cell(cellToInsertProduct + k + 5, 1).style({ border: { left: { style: 'thick', color: "black" }, top: { style: 'thick', color: "black" } } })
                                    ws.cell(cellToInsertProduct + k + 5, 2).style({ border: { right: { style: 'thick', color: "black" }, top: { style: 'thick', color: "black" } } })
                                    ws.cell(cellToInsertProduct + k + 6, 1).style({ border: { left: { style: 'thick', color: "black" } } })
                                    ws.cell(cellToInsertProduct + k + 6, 2).style({ border: { right: { style: 'thick', color: "black" } } })
                                    ws.cell(cellToInsertProduct + k + 7, 1).style({ border: { left: { style: 'thick', color: "black" }, bottom: { style: 'thick', color: "black" } } })
                                    ws.cell(cellToInsertProduct + k + 7, 2).style({ border: { right: { style: 'thick', color: "black" }, bottom: { style: 'thick', color: "black" } } })
                                }
                            }

                            lastCellInserted = lastCellInserted + 2

                        }
                    }

                    cellToInsertBox = lastCellInserted + 3

                }

                wb.write(('Bon de livraison' + todaysDate + ' ' + prodDechet.nom + '.xlsx'), res);

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
