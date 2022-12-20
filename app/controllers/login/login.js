const User = require('../../models/user')

module.exports = class Login {
    constructor(app) {
        this.app = app
        this.run()
    }

    /**
     * Middleware
     */
    async middleware() {
        this.app.get('/login', async (req, res) => {
            try {
                if (!req.query.identifiant || !req.query.mdp) {
                    return res.status(400).json({message: "Identifiant and MDP required"})
                }
                const user = await User.findOne({ where: { identifiant: req.query.identifiant} })
                if (user === null) {
                    return res.status(404).json({ message:"L'identifiant : " + req.query.identifiant + " n'existe pas" });
                  } else if (user.mdp != req.query.mdp){
                    return res.status(401).json({message: "The identifiant and MDP doesn't match"})
                  } else {
                    return res.send(user)
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