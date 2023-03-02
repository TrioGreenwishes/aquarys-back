const DispositifProduits = require('../../models/dispositifProduits');

module.exports = class GetDispositifProduit {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.get('/dispositifProduit/get', async (req, res) => {
            try {
                const dispositifProduit = await DispositifProduits.findAll({ where: { id_produit: req.query.id_produit} })
                if (!dispositifProduit) {
                    return res.status(404).json({ message:"Le dispositif produit possedantle produit avec l'id : " + req.query.id + " n'existe pas" });
                  } else {
                    return res.status(200).json({
                      code: 200,
                      data: dispositifProduit
                  })
                }
            } catch (error) {
                return res.status(500).json({ message: error.message || "Une erreur s'est produite lord du get" + req.query.id });
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
