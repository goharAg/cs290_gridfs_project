require("dotenv").config();
const upload = require("./routes/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./db");
const express = require("express");
const app = express();

let gridfsBucket;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "photos"
       });
});

app.use("/file", upload);

app.get("/file/:filename", async (req, res) => {
    
        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.on('error', function() {
            res.send("not found");
        });
        readStream.pipe(res);
   
});

app.delete("/file/:filename", async (req, res) => {
    try{
        let id;
        let files = await gridfsBucket.find({filename: req.params.filename}).toArray();
        if(!files.length) res.send("no such file");
        files.forEach(element => {
            id = element._id;
            gridfsBucket.delete(id);
            res.send("success");
        });
        
    }catch(error){
        console.log(error);
        res.send(error);
    }
   
});

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Listening on port ${port}...`));