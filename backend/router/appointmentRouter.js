import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  getDashboardStats,
  getPatientAppointments,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.get("/patient-appointments", isPatientAuthenticated, getPatientAppointments);
router.get("/dashboard-stats", isAdminAuthenticated, getDashboardStats);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;