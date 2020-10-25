const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:id', async (req, res) => {
    
    res.send(room);
});