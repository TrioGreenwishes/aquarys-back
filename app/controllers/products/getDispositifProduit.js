const DispositifProduits = require('../../models/dispositifProduits');
const { poolPromise } = require("../../db.js")

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
                const pool = await poolPromise
                const userCheck = `use Contrat
                select MAX(dispositifs_produits.nb_produit) as 'Max' 
                from dispositifs_produits,dispositifs_producteurs_dechets
                where dispositifs_produits.id_produit = ${req.query.id_produit}
                and dispositifs_produits.id_dispositif = dispositifs_producteurs_dechets.id_dispositif
                and dispositifs_producteurs_dechets.id_producteur_dechets = ${req.query.id_producteur}`
                const result = await pool.request().query(userCheck)
                if (!result.recordset) {
                    return res.status(404).json({ message:"Le dispositif produit possedantle produit avec l'id : " + req.query.id + " n'existe pas" });
                  } else {
                    return res.status(200).json({
                      code: 200,
                      data: result.recordset
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
