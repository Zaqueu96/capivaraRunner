const express = require('express');
const api = require('./api');
const app = express();

app.get("/sys02", (req, res) => {
    console.log("[SYSTEM02][/sys02] query: "+JSON.stringify(req.query));
    res.status(202).send();    
});

app.get("/users", async (req, res) => {
    try{
        console.log("[SYSTEM02][/users] ");
        const users = await api.listUsers()
       res.send(users);
    }catch(error){
        res.status(500).send({message: error.message});
    }
       
});

app.listen(9092, ()=> {
    console.log("[SYSTEM02] STARTED port 9092");
})