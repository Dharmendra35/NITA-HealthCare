import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    // !doctor_firstName ||
    // !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isConflict = await User.find({
    firstName: { $regex: new RegExp(`^${doctor_firstName.trim()}$`, 'i') },
    lastName: { $regex: new RegExp(`^${doctor_lastName.trim()}$`, 'i') },
    role: "Doctor",
    doctorDepartment: department,
  });
  
  // Debug logging
  console.log("Searching for doctor:", {
    firstName: doctor_firstName.trim(),
    lastName: doctor_lastName.trim(),
    department,
    foundDoctors: isConflict.length
  });
  
  if (isConflict.length === 0) {
    return next(new ErrorHandler(`Doctor "${doctor_firstName.trim()} ${doctor_lastName.trim()}" not found in ${department} department`, 404));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        400
      )
    );
  }
  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId,
    patientId,
  });
  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Send!",
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const getPatientAppointments = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id;
  const appointments = await Appointment.find({ patientId }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    appointments,
  });
});
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }
    
    // Allow updating status and appointment_time
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.appointment_time) updateData.appointment_time = req.body.appointment_time;
    
    appointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "Appointment Updated!",
      appointment,
    });
  }
);
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});

export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "Doctor" });
    const totalPatients = await User.countDocuments({ role: "Patient" });
    
    // Get appointment status counts
    const pendingAppointments = await Appointment.countDocuments({ status: "Pending" });
    const acceptedAppointments = await Appointment.countDocuments({ status: "Accepted" });
    const rejectedAppointments = await Appointment.countDocuments({ status: "Rejected" });

    // Get today's statistics
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Get recent activity (last appointment created)
    const recentAppointment = await Appointment.findOne().sort({ createdAt: -1 });
    let recentActivity = "No recent activity";
    
    if (recentAppointment && recentAppointment.createdAt) {
      const timeDiff = Date.now() - new Date(recentAppointment.createdAt).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      if (hoursAgo > 0) {
        recentActivity = `New appointment ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else if (minutesAgo > 0) {
        recentActivity = `New appointment ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
      } else {
        recentActivity = "New appointment just now";
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments: totalAppointments || 0,
        totalDoctors: totalDoctors || 0,
        totalPatients: totalPatients || 0,
        pendingAppointments: pendingAppointments || 0,
        acceptedAppointments: acceptedAppointments || 0,
        rejectedAppointments: rejectedAppointments || 0,
        todayAppointments: todayAppointments || 0,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
});