const express = require('express');

const port  = process.env.PORT || 3000;

var app = express();



//app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    console.log("meow");
    res.send("Done");
});

app.get('/thisGets', (req, res) => {
 console.log("meow");
 res.send("yes");
});
app.post('/thisPosts', (req, res) => {
   
});

app.get('/project',(req,res)=>{

});
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});