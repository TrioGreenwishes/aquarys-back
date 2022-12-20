// const Produits = require('../../models/produits');
// const Rebus = require('../../models/rebus');
// const Track = require('../../models/track');
// const TypeRebus = require('../../models/type_rebus');
const multer  = require('multer')
const fs  = require('fs')
const Track = require('../../models/track')
const Rebus = require('../../models/rebus')
const upload = multer({ dest: 'uploads/' })

module.exports = class UploadRebusController {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.post('/rebus/uploadPhoto', upload.single('files'), async function (req, res, next) {
            if (!fs.existsSync('uploads/' + req.body.id)){
                fs.mkdirSync('uploads/' + req.body.id);
            }
            const oldPath = 'uploads/' + req.file.filename
            const newPath = 'uploads/' + req.body.id +  '/' + req.file.originalname
            const finalPath = 'uploads/' + req.body.id +  '/'

            const track = await Track.findByPk(req.body.id)
            if(!track) {
                return res.status(400).json({ message: "L'id TRACK n'existe pas !" });
            }

            const rebus = Rebus.update({ path_dossier_photo: finalPath }, { where: { id_track: req.body.id } }).then(rebus => {
                if (rebus[0] !== 0) {
                    fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err
                        return res.json({ message: `Le rebus avec l'id= ${rebus.id} a été mise à jour avec succès.` });
                    })
                } else {
                    return res.status(404).json({ message: `Le rebus avec l'id= ${rebus.id} n'a pas été trouvée.` });
                };
            });
        })
    }

    /**
     * Run
     */
    run() {
        this.middleware()
    }
}
