const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')




router.get('/login', (req, res) => {
    console.log(req.body);
    res.send("Hello login")
});


module.exports = router