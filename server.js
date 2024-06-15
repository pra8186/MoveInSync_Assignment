require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//const mongoLink= process.env.MONGO_LINK;
const mongoLink=process.env.mongo_link;
const server = express();
server.listen(5000 ,()=>{
    console.log("the server is up and running");
});

mongoose.connect(mongoLink)
.then(() => {
    console.log("Connected to the Database");
}).catch((err) => {
    // console.log("Not Connected to the Database",mongoLink);
    console.log(err);   
});

server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: true }));

server.use("/api/auth", require("./routes/authRoutes"));
server.use("/api/trips", require("./routes/tripRoutes"));
server.use("/api/admin", require("./routes/adminRoutes"));

// {
//     "username":"xyz",
//     "phoneNo":9999999999,
//     "email": "yeyamer463@eqvox.com",
//     "password": "mnopqrstuv&212",
//     "isTraveler":0,
//     "isAdmin":0,
//     "isCompanion":1,
//     "notifications":[] 
  
//   }