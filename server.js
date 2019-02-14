const express = require('express');

const port  = process.env.PORT || 3000;

var app = express();
var session = require('express-session');
var mongoose =require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://L33903:NYPfyp339@cluster0-uv7is.mongodb.net/uipath?retryWrites=true',{useNewUrlParser: true});
const MongoStore = require('connect-mongo')(session);
const {TmpData} = require('./models/tmpData.js');
const {DocumentSchema} = require('./models/documentSchema.js');
//app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    console.log("meow");
    res.send("Done");
});
app.get("/getTodayData", function(req, res) {
    var json = {};
    var uniqueArr=[];
    TmpData.find().then((data ,e)=>{
        if (e)
        res.error("Failed to call database");
        else{
            res.send(data)
        }
    });
});
app.get('/thisGets', (req, res) => {
    res.send("test");
});
app.post('/thisPosts', (req, res) => {
    console.log("Start here ")
    var temp = new TmpData({
        _id: "heysssss",
        fileName : "fileNamessssssssss",
        text: "textsssssss"
    })
    temp.save().then((SpecificData,err)=>{
        if(err){
            console.log(err)
            res.send(err)
        }else{
            res.send("Saved boii")
        }
    });
   
});

app.get('/project',(req,res)=>{

});
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
