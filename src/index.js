const express=require("express")
const app=express()
const path =require("path")
const ejs=require("ejs")
//const {check,validationResult}=require('express-validator ')
const bodyParser=require('body-parser')
//const { template } = require("handlebars")
//const { request } = require("http")
//const collection =require("./mongodb")
//app.use=(express.static(path.join(__dirname,'views')));
app.use(express.json())
//const urlencodedParser=bodyParser.urlencoded({extended:false})
app.use(express.urlencoded({extended:false}))
app.set("view engine","ejs")
var currUser=0
const mongMod = require("./mongodb")
const collection = mongMod.collection
const objectCollection = mongMod.objectCollection
//app.engine('ejs', require('ejs').__express);
app.use(express.static(path.join(__dirname, '../public')))//מקשר את הדפי ejs  ל css רק להוסיף לינק לכל אחד מהם


app.get("/",(req,res)=>{
    res.render("login.ejs", { alertMessage: "" });
})

app.get("/signup",(req,res)=>{
    //res.render("signup") 
    res.render("signup.ejs", { alertMessage: "" });
})
app.get("/home",(req,res)=>{
    //res.render("signup") 
    res.render("home.ejs", { alertMessage: "" });
})

app.post("/signup",async(req,res)=>{
    
    const checkk=await collection.findOne({name:req.body.name})
    if(checkk!=null){
        //res.send("name taken")
        let alertMessage = " Username already taken";
        res.render("signup.ejs", { alertMessage });
       // res.render("signup.ejs", { alertMessage: "Username already taken" });
       
    }
else if(req.body.name==''||req.body.password==''){
     let alertMessage = " Fill the missing info";
        res.render("signup",{alertMessage});
}
    else{
        const data={
            name:req.body.name,
            password:req.body.password,
            admin:false
        };
        try {
            currUser = await collection.insertMany([data]);
            let alertMessage = " You have successfully signed up";
            res.render("home", { alertMessage }); // Changed this line
          } catch (error) {
            console.error(error);
            let alertMessage = " Error occurred while signing up";
            res.render("signup", { alertMessage }); // Changed this line
          }
        
        //await collection.insertMany([data])
        //let alertMessage = "you succsfully sign up";
        //res.render("signup", { alertMessage});
        
    }
    
})


app.post("/login",async(req,res)=>{
    
  try{
    const check=await collection.findOne({name:req.body.name}) 
if(check.password===req.body.password){
    let alertMessage="Hi "+req.body.name
    if(check.admin == true)
    {
        currUser = check
        res.render("adminHome",{alertMessage})
    }
    else{
        currUser = check
        res.render("home.ejs", { alertMessage});
    }
}
else{
    let alertMessage=" wrong password"
    res.render("login",{alertMessage})
}
  
  }
  catch{
    let alertMessage=" wrong details"
    res.render("login",{alertMessage})
  }
    
    })
    
   //**************************************************************************************************************************** 
   //****************************************************************************************************************************
   //**************************************************************************************************************************** 
   function openSearch() {
    document.getElementById("myOverlay").style.display = "block";
  }
  
  function closeSearch() {
    document.getElementById("myOverlay").style.display = "none";
  }
   //ADD OBJECT
app.get("/addObject",(req,res)=>{
res.render("addObject",{alertMessage:""});
console.log("ok")
})
app.post("/addObject",async (req,res)=>{
        if(currUser.admin == true)
        {
        console.log("1")
        let isValid = await objectCollection.findOne({category:req.body.category,name:req.body.name})
        if(isValid != null)
        {
            let info = {
                amount:parseInt(isValid.amount)+parseInt(req.body.amount)
            }
            await objectCollection.findOneAndUpdate({category:req.body.category,name:req.body.name},info)
            res.render("home",{alertMessage:""})
        }
        else if(req.body.name==''||req.body.color==''||req.body.matter==''||req.body.amount==''||req.body.pic==''||req.body.price==''||req.body.amount < 0||req.body.price < 0)
        {
            let alertMessage = "wrong info"
            res.render("addObject",{alertMessage})
        }
        else
        {
            let info = {
            name:req.body.name,
            color:req.body.color,
            matter:req.body.matter,
            amount:req.body.amount,
            pic:req.body.pic,
            price:req.body.price,
            category:req.body.category
            }
            try{
                await objectCollection.insertMany([info])
                let alertMessage = "hi"
                res.render("home", { alertMessage:"" });
            }
            catch (error) {
            console.error(error);
            let alertMessage = "Error";
            res.render("addObject.ejs", { alertMessage });
            }
        }
    }
    else{
        res.render("home",{alertMessage:"user is not admin"})
    }
    })

    //DELETE OBJECT
    app.get("/deleteObject",(req,res)=>{
        res.render("deleteObject",{alertMessage:""});
        console.log("ok")
        })
    app.post("/deleteObject",async (req,res)=>{
        if(currUser.admin == true){
            let isValid = await objectCollection.findOne({category:req.body.category,name:req.body.name})
            if(isValid != null)
            {
                let info = {
                    category:req.body.category,
                    name:req.body.name
                }
                await objectCollection.findOneAndDelete({category:req.body.category,name:req.body.name},info)
                res.render("home",{alertMessage:"done"})
            }
            else{
                let alertMessage = "wrong info"
                res.render("home",{alertMessage})
            }
        }
        else{
            res.render("home",{alertMessage:"user is not admin"})
        }
    })


    //SHOW OBJECT TO SCREEN
    
    app.get('/chairs', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"chair"}); 
        res.render('chairs', { details: data }); 
    });
    app.get('/bed', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"bed"}); 
        res.render('bed', { details: data }); 
    });
    app.get('/couch', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"couch"}); 
        res.render('couch', { details: data }); 
    });
    app.get('/mirror', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"mirror"}); 
        res.render('mirror', { details: data }); 
    });
    app.get('/rug', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"rug"}); 
        res.render('rug', { details: data }); 
    });
    app.get('/table', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"table"}); 
        res.render('table', { details: data }); 
    });



    /*********************************************************************************************************************************
     * *******************************************************************************************************************************
     * *******************************************************************************************************************************
     */

app.listen(3000,()=>{
    console.log("port connected")
})


