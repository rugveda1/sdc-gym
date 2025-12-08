const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    try {
        const dataPath = path.join(__dirname, '../exercises/data.json');
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

module.exports = router;
