let mongoose = require('mongoose');

let local_db = false
/*const MONGO_URI='mongodb+srv://' + 
    process.env.DB_USER + ':' + process.env.DB_PASS + 
    '@cluster0-oalds.mongodb.net/test?retryWrites=true&w=majority'*/
const hostname = '127.0.0.1';
const port = '27017'
const database = 'url-shortener';
let MONGO_URI = local_db ? 
    `mongodb://${hostname}:${port}/${database}` : 
    'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@cluster0-vakli.mongodb.net/test?retryWrites=true&w=majority';

class Database {
    constructor() {
        this.hostname = hostname;
        this.port = port
        this.name = database
        this.URI = MONGO_URI
        this._connect()
    }
  
    _connect() {
        mongoose.connect(MONGO_URI, { useNewUrlParser: true })
          .then(() => console.log('Database connection successful'))
          .catch(err => console.error('Database connection error'))
    }

}

module.exports = new Database()