const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.route('/:id')
  .get(getMedicine)
  .put(updateMedicine)
  .delete(deleteMedicine);

module.exports = router;