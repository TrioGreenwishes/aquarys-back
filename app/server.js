// Dependencies
const express = require("express")
const routes = require('./controllers/routes.js')
const bodyParser =  require('body-parser')
var cors = require('cors')

// Core

/**
 * Server
 */
module.exports = class Server {
  constructor() {
    this.app = express()
    this.run()
  }

  /**
   * Middleware
   */
  middleware() {
    this.app.use(cors())
    this.app.use(bodyParser.urlencoded({
      'extended': true
    }))
    this.app.use(bodyParser.json())
    this.app.use(cors())
  }

  /**
   * Routes
   */
  routes()  {
    new routes.example.ExampleController(this.app)
    new routes.box.UpdateBoxController(this.app);
    new routes.box.GetBoxByIdController(this.app);
    new routes.poste.GetPosteByIdController(this.app);
    new routes.track.CreateTrackController(this.app);
    new routes.track.GetBonDeLivraisonController(this.app);
    new routes.track.GetBonDeRepriseController(this.app);
    new routes.producteurDechets.GetProducteurDechet(this.app)
    new routes.comptage.CreateComptageController(this.app)
    new routes.colisage.CreateColisageController(this.app)
    new routes.rebus.CreateRebusController(this.app)
    new routes.rebus.GetAllTypeRebus(this.app)
    new routes.rebus.UploadRebusController(this.app)
    new routes.produits.GetProductByIdProducteurDechet(this.app)
    new routes.login.Login(this.app)
    new routes.produits.GetDispositifProduit(this.app)

    // If route not exist
    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: "Not Found"
      })
    })
  }

  /**
   * Security
   */
  security() {

  }

  /**
   * Run
   */
  run() {
    try {
      this.security()
      this.middleware()
      this.routes()
      const port = process.env.PORT || 4000
      this.app.listen(port)
      console.log(`Your port is ${port}`)
    } catch (e) {
      console.error(`[ERROR] Server -> ${e}`)
    }
  }
}
