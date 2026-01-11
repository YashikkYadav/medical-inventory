const express = require("express");
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createPatient).get(getPatients);
router.route("/:id").get(getPatientById).put(updatePatient).delete(deletePatient);

module.exports = router;
