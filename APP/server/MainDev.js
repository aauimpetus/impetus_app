// Import the necessary apis/libs & files
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const helmet = require("helmet");
const multer = require('multer'); // for file storage
require('dotenv/config');

// Load the routes
const dataRouter = require(__dirname+'/routes/data-route')
// Load the database init/creation
const db = require(__dirname+'/db/db_setup')

// Initialize a storage folder to store incoming files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./db/uploads")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E7 + 3);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({storage: storage});

// Create the express app (http server)
const app = express();
const appPort = process.env.APP_PORT;

// Call the necessary middlewares
app.use("/db/uploads", express.static(path.join(__dirname, "db", "uploads")));
app.use(cors()); // cross origin resources sharing should be enabled
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Set security HTTP headers
app.use(helmet());
app.use(upload.single('File'))

// Define main endpoint to start the app (serve the react views)
app.get('/', (req, res) => {
    res.send("App started")
});
// test the uploads url
app.get('/db/uploads', (req, res) => {
    console.log(req)
    res.send("got a hit")
})
// Call the router middleware to route the incoming requests
app.use('/api', dataRouter);

// Start the app by listening for incoming request
app.listen(appPort, () => {
    db.setupDB();
    db.setupTables();
    db.setupIndexes();
    console.log('Server is running on port ' + appPort);
});
