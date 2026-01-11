const express = require("express");
const router = express.Router();
const {
  getHospitalBills,
  getHospitalBill,
  createHospitalBill,
  updateHospitalBill,
  deleteHospitalBill,
} = require("../controllers/hospitalBillController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getHospitalBills).post(createHospitalBill);

router
  .route("/:id")
  .get(getHospitalBill)
  .put(updateHospitalBill)
  .delete(deleteHospitalBill);

module.exports = router;
