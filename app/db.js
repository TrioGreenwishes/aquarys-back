const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')
dotenv.config()
const sql = require('mssql')

const connectNewProd = new Sequelize('New_Prod', 'eamarelo', 'Gandia2021', {
  dialect: 'mssql',
  host: 'green-biboard',
  dialectOptions: {
    options: {
      instanceName: 'BIPREPROD'
    }
  }
})

const connectAquarys = new Sequelize('Aquarys', 'eamarelo', 'Gandia2021', {
  dialect: 'mssql',
  host: 'green-biboard',
  dialectOptions: {
    options: {
      instanceName: 'BIPREPROD'
    }
  }
})

const connectContrat = new Sequelize('Contrat', 'eamarelo', 'Gandia2021', {
  dialect: 'mssql',
  host: 'green-biboard',
  dialectOptions: {
    options: {
      instanceName: 'BIPREPROD'
    }
  }
})

const config = { 
  user: process.env.BDD_USER,
  password: process.env.BDD_MDP,
  // local
  server: process.env.BDD_SERVER  +"\\" + "BIPREPROD", // You can use 'localhost\\instance' to connect to named instance
  // ikoula
 //  server: '193.56.15.196'
  database: process.env.BDD_NAME,
  driver: 'tedious',
  options: {
       encrypt: false // Use this if you're on Windows Azure
  }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {connectNewProd, connectAquarys, connectContrat, sql, poolPromise}
