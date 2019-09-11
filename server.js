'use strict';
// IMPORTS
const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./database');
const ShortUrl = require('./models');

// Basic Configuration 
const port = process.env.PORT || 3000;
const hostname = '127.0.0.1';

// INITIALIZE THE APP
const app = express();

// Serve static assets mounting the express.static() middleware
app.use('/public', express.static(__dirname + '/public'));

// Use Cross-origin resource sharing to allow AJAX requests to skip 
// the same-origin policy and access resources from remote hosts
app.use(cors());

// Mount the body parser middleware to extract the entire body portion 
// of an incoming request stream and expose it on req.body
// Support parsing of application/json type post data
app.use(bodyParser.json())

// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true}));

// Main page
app.get("/", function(req, res){
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", function(req, res){
    createShortUrl(res, req.body.url);
})

// Main API endpoint
// Note:
//  Add '(*)' to the request parameter to include special characters
app.get("/api/shorturl/:input(*)", function(req, res){  
    const inputArr = req.params.input.split(" - ");

    if(inputArr[0].toLowerCase() === "new"){
        
        // ShortUrl creation    -------------------------------------
        if(inputArr.length !== 2)
            res.json({"error": "invalid URL"});
        
        const address = inputArr[1];
        createShortUrl(res, address);
            
    }else if(!isNaN(req.params.input)){
      
        // Get the shorted URL -------------------------------------
        //res.json({x: parseInt(req.params.input)});
        // Check if the 'short_url' exists in the database
        ShortUrl.findOne({short_url: parseInt(req.params.input)})
                .then(doc => {
                    if(doc){
                        res.redirect(doc.original_url);
                    }else{
                        res.json({"error":"No short url found for given input"})
                    }                    
                })
                .catch(err => console.error(err));
    }
});

// Function to be used by two end points:
//  app.post in app/
//  app.get like in app/api/shorturl/new - https://www.freecodecamp.org
const createShortUrl = (res, address) => {

    const expression = /(https?:\/\/www\.)[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}/;
    if(!expression.test(address))
        res.json({"error": "invalid URL"});
      
    // Check if the ulr already exists in the database
    ShortUrl.findOne({original_url: address})
        .then(doc => {

            if(doc === null){
                // If it doesn't exist
                // Create the document (row) in the database
                let newUrl = new ShortUrl({ original_url: address });
                newUrl.save()
                    .then(doc => {
                        res.json({
                            original_url: doc.original_url, 
                            short_url: doc.short_url
                        })
                    })
                    .catch(err => console.error(err))
            
            }else{
                // If it exists, get the 'short_url'
                res.json({
                    original_url: doc.original_url,
                    short_url: doc.short_url                                
                });
            }

        })
        .catch(err => console.error(err));

}

app.listen(port, function () {
    //console.log(`Server running at http://${hostname}:${port}`);
});