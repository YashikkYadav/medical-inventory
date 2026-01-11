const express = require("express");
const router = express.Router();
const {
  createIpdBill,
  getIpdBills,
  getIpdBillById,
  updateIpdBill,
  deleteIpdBill,
} = require("../controllers/ipdBillController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createIpdBill).get(getIpdBills);
router.route("/:id").get(getIpdBillById).put(updateIpdBill).delete(deleteIpdBill);

module.exports = router;
