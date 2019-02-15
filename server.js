const express = require('express');
const port  = process.env.PORT || 3000;
var app = express();
var session = require('express-session');
var mongoose =require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://L33903:NYPfyp339@cluster0-uv7is.mongodb.net/uipath?retryWrites=true`,{useNewUrlParser: true});
const MongoStore = require('connect-mongo')(session);
const {TmpData} = require('./models/tmpData.js');
const {DocumentSchema} = require('./models/documentSchema.js');
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
//app.use(express.static(__dirname + '/public'));
var discovery = new DiscoveryV1({
    version: "2018-12-03",
    iam_apikey: "XY7qAvxjeqpNx0jwkBzm-6PaZEFPwkgv5LNLHpXp-CBl", 
    url: "https://gateway-syd.watsonplatform.net/discovery/api"
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    console.log("meow");
    res.send("Done");
});
app.get("/getTodayData", function(req, res) {
    var json = {};
    var uniqueArr=[];
    TmpData.find().then((data ,e)=>{
        if (e)
        res.error("Failed to call databases");
        else{
            console.log("data length ",data.length);
            console.log("data ",data);
            for( var i =0 ; i<data.length;i++){
                //eg . news/law > law
                var lastCategory = data[i].category.slice(data[i].category.lastIndexOf("/")+1);
                if(!uniqueArr.includes(lastCategory)){
                    json[lastCategory]= [];
                    json[lastCategory].push({
                        id: data[i]._id,
                        title: data[i].fileName,
				        description : data[i].text
                    })
                    uniqueArr.push(lastCategory);
                }
                else{
                    json[lastCategory].push({
                        id: data[i]._id,
                        title: data[i].fileName,
				        description : data[i].text
                    })
                }
            }
            res.send(json)

        }
    });
});
app.get('/newDatas', function(req, res) {
    var hour23 = 82800000;
    TmpData.findOne().then((data ,e)=>{
        if (e)
        res.error("Failed");
        else{
            if(data && Date.now() - data.date_created > hour23){
                //check time #true to proceeding adding everything
                TmpData.collection.remove();
                res.send(true);
            }
            else if(!data){
                res.send(true);
            }
            else
            res.send(false);
            //console.log(JSON.stringify(data, null, 2));
            //res.send(data.date_created);
        }
       
    });
});
app.get('/getCategory', (req,res)=>{
    
    TmpData.find().then((tmpdb , e )=>{
        if (e)
        console.log("Error od mongodb is : ",e)
        else
        {
            for(var c = 0 ; c< tmpdb.length; c++){
                
                discovery.query({ environment_id: "2f772c95-aa43-4065-8882-f479524a8dc1", collection_id: "d71d5468-e4b4-4629-b927-40b39dbb1a90", filter:`_id:${tmpdb[c]._id}`},function(e,data){
                    if (e)
                    console.log(e);
                    else{
                    //    for (let i = 0, p = Promise.resolve(); i < data.matching.results; i++) {
                    //     p = p.then(_ => new Promise(resolve =>
                    //         DocumentSchema.findOneAndUpdate({
                    //             _id : data.results[x].id
                    //         },{$set: {category: data.results[x].enriched_text.categories[0].label.replace("/", "")}},
                    //         {upsert:true,new:true}).then((data,err) =>{
                    //             if (err)
                    //             console.log(err);
                        
                    //             else {
                    //                 console.log(data);
                    //                 resolve();  
                    //             }
                    //             // set data
                    //         })
                    //     ));
                    // }
                    DocumentSchema.findOneAndUpdate({
                        _id : data.results[0].id
                    },{$set: {category: data.results[0].enriched_text.categories[0].label}},
                    {upsert:true,new:true}).then((data,err) =>{
                        if (err)
                        console.log(err);
                    });
                    console.log("CATEGORYYYY : ",data.results[0].enriched_text.categories[0].label);
                    TmpData.findOneAndUpdate({
                        _id : data.results[0].id
                    },{$set: {category: data.results[0].enriched_text.categories[0].label}},
                    {upsert:true,new:true}).then((data,err) =>{
                        if (err)
                        console.log(err);
                    });    
                    }
                   
                })
           }
            res.send("donzzes ");
        }
        
    });
    
});
app.post('/addDiscovery', (req,res)=>{
    //Adding file into datas.json then pushing into watson
    
    console.log(JSON.stringify(req.body, null, 2));
    // the meow converter 
var text = req.body.text.replace(/\?meow\?/g, '"');
var fileName = req.body.fileName;
var  buf = Buffer.from(JSON.stringify({text: text}));


discovery.addDocument({ environment_id: "2f772c95-aa43-4065-8882-f479524a8dc1", 
                        collection_id: "d71d5468-e4b4-4629-b927-40b39dbb1a90", 
                        file: buf,
                        metadata: undefined,
                        file_content_type: "application/json",
                        filename: fileName 
    },function(error, data){
        if(error){
            console.log("Error is ",error)
            res.status(404).send(e);
        }
        else{
            var newID = data.document_id
            var doc = new DocumentSchema({
                _id: newID,
                fileName : fileName,
                text: text
            });
            doc.save().then((SpecificData)=>{});

            var temp = new TmpData({
                _id: newID,
                fileName : fileName,
                text: text
            });
            temp.save().then((SpecificData)=>{});

            console.log(JSON.stringify(data, null, 2));
            res.send("Hey it work");
        }
    });
});
app.get('/useReport', (req,res)=>{
    TmpData.find().then((tmpdb , e )=>{
        if (e)
        console.log("Error od mongodb is : ",e)
        else
        {
            discovery.query({ environment_id: "2f772c95-aa43-4065-8882-f479524a8dc1", collection_id: "d71d5468-e4b4-4629-b927-40b39dbb1a90",filter:`_id:${tmpdb[0]._id}`},function(e,data){
                res.send(data)
            })
        }
    })
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
