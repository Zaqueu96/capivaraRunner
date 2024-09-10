const express = require('express');

const app = express();

app.get("/sys01", (req, res) => {
    console.log("[SYSTEM01][/sys01] query: "+JSON.stringify(req.query));
    res.sendStatus(202);    
});

app.listen(9091, ()=> {
    console.log("[SYSTEM01] STARTED port 9091");
})