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
var loggedIn=true
var v =0;
let alertMessage=""
const mongMod = require("./mongodb")
const collection = mongMod.collection
const objectCollection = mongMod.objectCollection
const purchaseCollection=mongMod.purchaseCollection
//app.engine('ejs', require('ejs').__express);
app.listen(3000,()=>{
    console.log("port connected")
})
app.use(express.static(path.join(__dirname, '../public')))//מקשר את הדפי ejs  ל css רק להוסיף לינק לכל אחד מהם
const session = require('express-session')
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  store:require('connect-mongo').create({mongoUrl:"mongodb+srv://eliav:2001@ourshop.vtknxmb.mongodb.net/?retryWrites=true&w=majority"})
  /*store: new MongoStore({
    url:"mongodb+srv://eliav:2001@ourshop.vtknxmb.mongodb.net/?retryWrites=true&w=majority",
    ttl:12*24*60*60,
    autoRemove:'native'
  })*/
}));

app.get("/",(req,res)=>{
    
    res.render("home.ejs", { alertMessage,loggedIn: req.session.user !== undefined });
})

app.get("/ContactUs",(req,res)=>{
    res.render("ContactUs",{alertMessage:" "})
})

app.get("/aboutus",(req,res)=>{
    res.render("aboutus")
})

app.get("/signup",(req,res)=>{
    //res.render("signup") 
    res.render("signup.ejs", { alertMessage: "" ,loggedIn: req.session.user !== undefined});
})
app.get("/login",(req,res)=>{
    
    res.render("login.ejs", { alertMessage: "",loggedIn: req.session.user !== undefined});
})


app.post("/signup",async(req,res)=>{
    
    const checkk=await collection.findOne({name:req.body.name})
    if(checkk!=null){
        //res.send("name taken")
        let alertMessage = "שם משתמש כבר תפוס";
        res.render("signup.ejs", { alertMessage ,loggedIn: req.session.user !== undefined});
       // res.render("signup.ejs", { alertMessage: "Username already taken" });
    }
else if(req.body.name==''||req.body.password==''){
     let alertMessage = " מלא את המידע החסר";
        res.render("signup",{alertMessage,loggedIn: req.session.user !== undefined});
}
    else{
        const data={
            name:req.body.name,
            password:req.body.password,
            admin:false,
            cart:{}
        };
        try {
            req.session.user = await collection.insertMany([data]);
            loggedIn=true
            let alertMessage = "היי "+req.body.name;
            res.render("login", { alertMessage }); // Changed this line
          } catch (error) {
            console.error(error);
            let alertMessage = "קיימת בעיה בהרשמה";
            res.render("signup", { alertMessage,loggedIn: req.session.user !== undefined }); // Changed this line
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
    let alertMessage="היי "+req.body.name
    if(check.admin == true)
    {
        req.session.user = check
        loggedIn = true
        res.render("adminHome",{alertMessage,loggedIn})
    }
    else{
        req.session.user = check
        loggedIn=true
        res.render("home.ejs", { alertMessage,loggedIn});
    }
}
else{
    let alertMessage=" סיסמא שגויה"
    res.render("login",{alertMessage,loggedIn: false})
}
  
  }
  catch{
    let alertMessage=" פרטים שגויים"
    res.render("login",{alertMessage,loggedIn: req.session.user !== undefined})
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
        if(req.session.user.admin == true)
        {
        console.log("1")
        let isValid = await objectCollection.findOne({category:req.body.category,name:req.body.name})
        if(isValid != null)
        {
            let info = {
                amount:parseInt(isValid.amount)+parseInt(req.body.amount)
            }
            await objectCollection.findOneAndUpdate({category:req.body.category,name:req.body.name},info)
            res.render("adminHome",{alertMessage:""})
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
                res.render("adminHome", { alertMessage:"" });
            }
            catch (error) {
            console.error(error);
            let alertMessage = "Error";
            res.render("addObject.ejs", { alertMessage });
            }
        }
    }
    else{
        res.render("home",{alertMessage:"המשתמש לא מנהל"})
    }
    })

    //DELETE OBJECT
    app.get("/deleteObject",(req,res)=>{
        res.render("deleteObject",{alertMessage:""});
    })
    app.post("/deleteObject",async (req,res)=>{
        if(req.session.user.admin == true){
            let isValid = await objectCollection.findOne({category:req.body.category,name:req.body.name})
            if(isValid != null)
            {
                let info = {
                    category:req.body.category,
                    name:req.body.name
                }
                await objectCollection.findOneAndDelete({category:req.body.category,name:req.body.name},info)
                res.render("adminHome",{alertMessage:"בוצע"})
            }
            else{
                let alertMessage = "מידע שגוי"
                res.render("adminHome",{alertMessage})
            }
        }
        else{
            res.render("home",{alertMessage:"המשתמש לא אדמין"})
        }
    })


    //SHOW OBJECT TO SCREEN
    
    app.get('/chairs', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"chair","amount": { $gte: 1}}); 
        res.render('chairs', { details: data }); 
    });
    app.get('/bed', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"bed","amount": { $gte: 1}}); 
        res.render('bed', { details: data }); 
    });
    app.get('/couch', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"couch","amount": { $gte: 1}}); 
        res.render('couch', { details: data }); 
    });
    app.get('/mirror', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"mirror","amount": { $gte: 1}}); 
        res.render('mirror', { details: data }); 
    });
    app.get('/rug', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"rug","amount": { $gte: 1}}); 
        res.render('rug', { details: data }); 
    });
    app.get('/table', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"table","amount": { $gte: 1}}); 
        res.render('table', { details: data }); 
    });
    app.get('/armchairs', async (req, res) => {
        // Query for the data from MongoDB
        const data = await objectCollection.find({"category":"armchair","amount": { $gte: 1}}); 
        res.render('armchairs', { details: data }); 
    });
   
   
    app.post('/logout', (req, res) => {
        if (req.session) {
            req.session.destroy()
            loggedIn=false
            console.log('User logged out');
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'You were not logged in' });
        }
    });

    app.get("/search",(req,res)=>{
        res.render("search.ejs")
    })
    app.post('/search',async(req,res)=>{
        var infor=[]
        var chairInfo=''
        var armInfo=''
        var tableInfo=''
        var sofaInfo=''
        var accsInfo=''
        var bedInfo=''
        var mirInfo=''
       if(await objectCollection.findOne({name:req.body.name}))
        {
            infor.push(await objectCollection.findOne({name:req.body.name}))
        }
        if(req.body.chair == "on")
        {
            chairInfo = await objectCollection.find({"category":"chair" ,"price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((chairInfo))
        }
            
        if(req.body.arm == "on"){
            armInfo = await objectCollection.find({"category":"armchair", "price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((armInfo))
        }
        if(req.body.table == "on")
        {
            tableInfo = await objectCollection.find({"category":"table", "price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((tableInfo))
        }
        if(req.body.sofa == "on")
        {
            sofaInfo =await objectCollection.find({"category":"couch","price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((sofaInfo))
        }
        if(req.body.rug== "on")
        {
            accsInfo = await objectCollection.find({"category":"rug","price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((accsInfo))
        }
        if(req.body.bed == "on"){
            bedInfo = await objectCollection.find({"category":"bed","price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((bedInfo))
        }
        if(req.body.mirror == "on"){
            bedInfo = await objectCollection.find({"category":"mirror","price": { $gte: req.body.min, $lte: req.body.max },"amount": { $gte: 1}})
            infor.push((bedInfo))
        }
        v = infor
        res.render("search",{infor})
        
       // res.json({infor})
    })
   ///////////////////////// MyAccount

   app.get("/myAccount", async (req, res) => {
    if (req.session.user !== undefined) {
      res.render("myAccount", { loggedIn:true, user:req.session.user });
    } else {
      res.redirect("/login");
    }
  });
  
  // Route handler for changing password
  app.get("/changePassword", (req, res) => {
    res.render("changePassword",{loggedIn:true,user:req.session.user});
  });
  
app.post("/changePassword", async(req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    if (currentPassword !== req.session.user.password) {
      res.render("changePassword", { loggedIn:true,message: "סיסמא נוכחית לא נכונה" });
    } else if (newPassword !== confirmPassword) {
      res.render("changePassword", { loggedIn:true,message: "רשום את סיסמא החדשה באופן זהה בשני התיבות" });
    } else {
      // Update the user's password in the database
      let isValidd = await collection.findOne({name:req.session.user.name})
      if(isValidd != null)
      {
          let infoo = {
              password:newPassword
            }
           
          await collection.findOneAndUpdate({name:req.session.user.name},infoo)
      res.render("changePassword", { loggedIn:true,message: "הסיסמא סונתה בהצלחה" });
    }
    else{
        res.render("changePassword", { loggedIn:true,message: "הסיסמא לא שונתה" });
    }
    }
  });

  app.get("/accountInformation",async (req, res) => {
    // Retrieve account information for the current user from the database
    // Render the accountInformation.ejs template with the account information data
    res.render("accountInformation", {loggedIn:true ,alertMessage:"",user:req.session.user });
  });
  app.get("/OrderHistory",async(req,res)=>{
    let acc = await purchaseCollection.find({"name":req.session.user.name})
    res.render("OrderHistory",{alertMessage:"היי",details:acc,loggedIn:true,user:req.session.user})
  })

  app.get("/addCart",async (req,res)=>{
    if(req.body.checker == undefined){
        let referringPage = req.headers.referer || '/';
        res.redirect(referringPage)
    }
    else{
        
        let referringPage = req.headers.referer || '/';
        res.render("search",{infor:v})
        
    }
})
app.post("/addCart",async (req,res)=>{
if(loggedIn){
    console.log(1)
    if(!req.session.user){
        console.log(2)
        res.render("login",{alertMessage,loggedIn: false})
        return
    }
    let d = await collection.findOne({name:req.session.user.name})
    let flag = 1
    let i =0;
    if(d.cart==undefined)
    {
        console.log(3)
        d.cart={}
        d.cart.totalSize = 0
        d.cart.totalPrice = 0
        d.cart.objs = []
        
    } 
    if(d.cart.totalSize == 0)
    {
        console.log(4)
        d.cart.totalSize+=parseInt(req.body.amount)
        d.cart.totalPrice += parseInt(req.body.price)*parseInt(req.body.amount)
        let inf={
            name:req.body.name,
            category:req.body.category,
            price:req.body.price,
            pic:req.body.pic,
            amount:parseInt(req.body.amount),
            color:req.body.color,
            matter:req.body.matter
        }
        console.log(5)
        d.cart.objs.push(inf)
        await d.save()
        if(req.body.checker == undefined){
            let referringPage = req.headers.referer || '/';
            res.redirect(referringPage)
        }
        else{
            
            let referringPage = req.headers.referer || '/';
            res.render("search",{infor:v})
            
        }
        return
    }
    else
    {
        console.log(6)
        d.cart.objs.forEach(function(item) {
            if(item.name == req.body.name){
                flag = 0
                item.amount+=parseInt(req.body.amount)
                d.cart.totalPrice += parseInt(req.body.price)*parseInt(req.body.amount)
                d.cart.totalSize+=parseInt(req.body.amount)

            }
        });
        if(flag){
            let inf={
               name:req.body.name,
               category:req.body.category,
               price:req.body.price,
               pic:req.body.pic,
               amount:req.body.amount,
               color:req.body.color,
               matter:req.body.matter
            }
            d.cart.objs.push(inf)
            d.cart.totalPrice += (parseInt(req.body.price)*parseInt(req.body.amount))
            d.cart.totalSize += parseInt(req.body.amount)
        }
        await d.save();
        console.log(7)
        console.log(v)
        if(req.body.checker == undefined){
            let referringPage = req.headers.referer || '/';
            res.redirect(referringPage)
        }
        else{
            
            let referringPage = req.headers.referer || '/';
            res.render("search",{infor:v})
            
        }
        return
    }
    }
    else
    {
        res.render("home",{alertMessage:"התחבר למשתמש"})
    }
})

app.get("/Mybag",async (req,res)=>{ 
    if(req.session.user!== undefined && req.session.user.cart !== undefined){
        let r = await collection.findOne({name:req.session.user.name})
        res.render("Mybag", {alertMessage:"היי",details:[r.cart.objs],num:r.cart.totalSize,price:r.cart.totalPrice});
    }
    else if(req.session.user == undefined){
        res.render("login",{alertMessage:"התחבר לחשבון"})
    }
    else if(req.session.user.cart == undefined){
        res.render("home",{alertMessage:"ראשית תוסיף לעגלת הקניות"})
    }
    
    else{
        res.redirect("/login")
    }
})
app.get("/deleteItem",async (req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    res.render("Mybag",{alertMessage:"היי",details:[r.cart.objs],num:req.session.user.cart.totalSize,price:req.session.user.cart.totalPrice})
})
app.post("/deleteItem",async (req,res)=>{
  
    let p = await collection.findOne({name:req.session.user.name})
    let delItem = await objectCollection.findOne({name:req.body.name})
    
    //console.log(p.cart)
    if(p)
    {
        p.cart.totalPrice -= parseInt(delItem.price)
        p.cart.totalSize -= 1
        filteredArr=p.cart.objs.filter(item => item.name !== delItem.name)
        p.cart.objs = filteredArr
        
        await p.save()
        res.render("Mybag",{alertMessage:"היי",details:[p.cart.objs],num:p.cart.totalPrice,price:p.cart.totalPrice})
    }
    
})

app.get('/delAll',async (req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    r.cart = {}
    await r.save()
    res.render("Mybag",{alertMessage:"היי",details:[r.cart.objs],num:req.session.user.cart.totalSize,price:req.session.user.cart.totalPrice})
})

app.get('/checkout',async (req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    if(r.cart.objs.length == 0){
        res.render("home",{alertMessage:"שגיאה"})
        return
    }
    
    res.render("checkout",{details:[r.cart.objs],size:req.session.user.cart.totalSize,price:req.session.user.cart.totalPrice});
})
app.get("/deleteItemC",async (req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    res.render("checkout",{details:[r.cart.objs],size:req.session.user.cart.totalSize,price:req.session.user.cart.totalPrice});
})
app.post("/deleteItemC",async (req,res)=>{
    
    let p = await collection.findOne({name:req.session.user.name})
    var delItem = await objectCollection.findOne({name:req.body.name})
    
    
    if(p)
    {
        p.cart.totalPrice -= parseInt(delItem.price)
        p.cart.totalSize -= 1
        filteredArr=p.cart.objs.filter(item => item.name !== delItem.name)
        p.cart.objs = filteredArr
        await p.save()
        res.render("checkout",{details:[p.cart.objs],num:p.cart.totalPrice,price:p.cart.totalPrice})
    }
    
})
app.get('/buy',async (req,res)=>{
    let acc = await collection.findOne({name:req.session.user.name})
    const today = new Date();
    const options = { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Jerusalem',
        timeZoneName: 'short'
    }
    
    var f={
        purHis:acc.cart.objs,
        name:req.session.user.name,
        date:today.toLocaleDateString('en-GB',options)
    }
    var v = await purchaseCollection.insertMany([f])
    acc.cart.objs.forEach(async function(item){
        let am = item.amount
        let d = await objectCollection.findOne({name:item.name})
        if(parseInt(am) > d.amount){
            res.render("home",{alertMessage:"שגיאה"})
            
        }
        else{
            d.amount -= parseInt(am)
            await d.save();
            
        }
    })
    acc.cart={}
    await acc.save()
    res.render("home",{alertMessage:"נרכש"});
})

app.get('/amount',async (req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    res.render("Mybag", {alertMessage:"היי",details:[r.cart.objs],num:r.cart.totalSize,price:r.cart.totalPrice});
})

app.post('/amount',async(req,res)=>{
    console.log(req.body.name)
    let r = await collection.findOne({name:req.session.user.name})
    r.cart.objs.forEach(function(item){
        if(item.name == req.body.name){
            item.amount+=1
            r.cart.totalPrice+=parseInt(item.price)
            r.cart.totalSize += 1
        }
    })
    await r.save()
    res.render("Mybag", {alertMessage:"היי",details:[r.cart.objs],num:r.cart.totalSize,price:r.cart.totalPrice});
})

app.get('/amountM',async(req,res)=>{
    let r = await collection.findOne({name:req.session.user.name})
    res.render("Mybag", {alertMessage:"היי",details:[r.cart.objs],num:r.cart.totalSize,price:r.cart.totalPrice});
})

app.post('/amountM',async (req,res)=>{
    console.log(1)
    console.log(req.body.name)
    let r = await collection.findOne({name:req.session.user.name})
    r.cart.objs.forEach(function(item){
        if(item.name == req.body.name){
            item.amount-=1
            r.cart.totalPrice-=parseInt(item.price)
            r.cart.totalSize -= 1
        }
    })
    await r.save()
    res.render("Mybag", {alertMessage:"היי",details:[r.cart.objs],num:r.cart.totalSize,price:r.cart.totalPrice});
})

    /*********************************************************************************************************************************
     * *******************************************************************************************************************************
     * *******************************************************************************************************************************
     */



