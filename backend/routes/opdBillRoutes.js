const express = require("express");
const router = express.Router();
const {
  createOpdBill,
  getOpdBills,
  getOpdBillById,
  updateOpdBill,
  deleteOpdBill,
} = require("../controllers/opdBillController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createOpdBill).get(getOpdBills);
router.route("/:id").get(getOpdBillById).put(updateOpdBill).delete(deleteOpdBill);

module.exports = router;
