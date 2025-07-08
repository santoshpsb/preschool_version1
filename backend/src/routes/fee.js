const express = require('express');

const router = express.Router();

const EnrollFee = require('../models/Fee');

const verifyToken = require("../middleware/authMiddleware");



// Add enroll fee details for a student

router.post('/', async (req, res) => {

try {

const { studentId } = req.body;

const existing = await EnrollFee.findOne({ studentId });

if (existing && !req.body.forceUpdate) {

// Tell frontend that record exists

return res.status(409).json({ error: 'Fee details already exist for this student.' });

}

const updated = await EnrollFee.findOneAndUpdate(

{ studentId },

req.body,

{ new: true, upsert: true }

);

res.status(200).json({ message: existing ? 'Fee details updated.' : 'Fee details enrolled successfully!', enrollFee: updated });

} catch (error) {

res.status(400).json({ error: error.message });

}

});



// Get enroll fee details by studentId

router.get('/:studentId', async (req, res) => {

try {

const enrollFee = await EnrollFee.findOne({ studentId: req.params.studentId });

if (!enrollFee) {

return res.status(404).json({ error: 'Fee details not found for this student' });

}

res.json({ enrollFee });

} catch (error) {

res.status(500).json({ error: error.message });

}

});



module.exports = router;