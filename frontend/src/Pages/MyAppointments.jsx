import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { isAuthenticated } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/patient-appointments`,
          { withCredentials: true }
        );
        setAppointments(data.appointments);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch appointments");
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffa500";
      case "Accepted":
        return "#28a745";
      case "Rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "Not scheduled yet") {
      return "Not scheduled";
    }
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="container appointments-page">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading your appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container appointments-page">
      <h1>My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="empty-appointments">
          <h3>No appointments found</h3>
          <p>You haven't booked any appointments yet.</p>
          <a href="/appointment" style={{ color: "#271776ca", textDecoration: "none" }}>
            Book your first appointment →
          </a>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <h3>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</h3>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(appointment.status),
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    {appointment.status}
                  </span>
                  {appointment.appointment_time && appointment.appointment_time !== "Not scheduled yet" && appointment.status === "Accepted" && (
                    <span style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      ⏰ {formatTime(appointment.appointment_time)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="appointment-details">
                <p><strong>Department:</strong> {appointment.department}</p>
                <p><strong>Appointment Date:</strong> {formatDate(appointment.appointment_date)}</p>
                <p><strong>Appointment Time:</strong> {
                  appointment.status === "Rejected"
                    ? <span style={{color: "#dc3545", fontWeight: "bold"}}>Please try another date</span>
                    : appointment.status === "Accepted" && appointment.appointment_time && appointment.appointment_time !== "Not scheduled yet"
                    ? <span style={{color: "#28a745", fontWeight: "bold"}}>{formatTime(appointment.appointment_time)}</span>
                    : <span style={{color: "#ffa500"}}>Time not scheduled yet</span>
                }</p>
                <p><strong>Patient:</strong> {appointment.firstName} {appointment.lastName}</p>
                <p><strong>Phone:</strong> {appointment.phone}</p>
                <p><strong>Address:</strong> {appointment.address}</p>
                <p><strong>Previous Visit:</strong> {appointment.hasVisited ? "Yes" : "No"}</p>
                {appointment.createdAt && (
                  <p><strong>Booked On:</strong> {formatDate(appointment.createdAt)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;