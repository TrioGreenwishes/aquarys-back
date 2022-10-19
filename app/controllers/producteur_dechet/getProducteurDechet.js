// // Core
const sql = require("mssql")
// const fs = require("fs")
const { poolPromise } = require("../../db.js")
const ProducteurDechet = require('../../models/producteur_dechets')

module.exports = class GetProducteurDechet {
    constructor(app) {
      this.app = app
      this.run()
    }

    /**
     * Middleware
     */
     async middleware() {
      this.app.get(`/producteurDechet/get`, async (req, res) => {
        try {
          const producteurDechet = await ProducteurDechet.findByPk(req.query.id)
          if (producteurDechet === null) {
              console.log('Not found!');
            } else {
              return res.status(200).json({
                code: 200,
                data: producteurDechet
            })
          }
        } catch (e) {
          console.log(e)
          console.error(`[ERROR] GetProducteurDechet/get -> ${e}`)
          await sql.close()
        }
      })

    }

    /**
     * Run
     */
    run() {
        this.middleware()
    }
}
