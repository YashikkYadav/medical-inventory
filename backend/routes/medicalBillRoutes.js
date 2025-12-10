const express = require("express");
const router = express.Router();
const {
  getMedicalBills,
  getMedicalBill,
  createMedicalBill,
  updateMedicalBill,
  deleteMedicalBill,
} = require("../controllers/medicalBillController");

router.route("/").get(getMedicalBills).post(createMedicalBill);

router
  .route("/:id")
  .get(getMedicalBill)
  .put(updateMedicalBill)
  .delete(deleteMedicalBill);

module.exports = router;
