import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    rejectedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/getall`,
          { withCredentials: true }
        );
        setAppointments(appointmentsResponse.data.appointments);

        // Fetch dashboard stats
        const statsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/dashboard-stats`,
          { withCredentials: true }
        );
        
        if (statsResponse.data && statsResponse.data.stats) {
          setStats(statsResponse.data.stats);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Dashboard data fetch error:", error.response?.data || error.message);
        setAppointments([]);
        setLoading(false);
        
        if (error.response?.status === 401 || error.response?.status === 400) {
          // Authentication error - redirect to login
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          toast.error(`Failed to fetch dashboard data: ${error.response?.data?.message || error.message}`);
        }
      }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      
      // Update appointments list
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      
      // Refresh stats to reflect the status change
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/dashboard-stats`,
        { withCredentials: true }
      );
      
      if (statsResponse.data && statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
      }
      
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleUpdateTime = async (appointmentId, appointmentTime) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/update/${appointmentId}`,
        { appointment_time: appointmentTime },
        { withCredentials: true }
      );
      
      // Update appointments list
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, appointment_time: appointmentTime }
            : appointment
        )
      );
      
      toast.success("Appointment time updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update time");
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/getall`,
        { withCredentials: true }
      );
      setAppointments(appointmentsResponse.data.appointments);

      // Fetch dashboard stats
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/dashboard-stats`,
        { withCredentials: true }
      );
      
      if (statsResponse.data && statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
      }
      
      setLoading(false);
      toast.success("Dashboard data refreshed!");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to refresh dashboard data");
      console.error("Dashboard refresh error:", error);
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  if (loading) {
    return (
      <section className="dashboard page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2>Loading Dashboard...</h2>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3939d9f2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="docImg" />
            <div className="content">
              <div>
                <p>Hello,</p>
                <h5>
                  {admin &&
                    `${admin.firstName} ${admin.lastName}`}{" "}
                </h5>
              </div>
            </div>
          </div>
          <div className="secondBox">
            <p>Total Appointments</p>
            <h3>{loading ? <span style={{fontSize: "24px"}}>Loading...</span> : (stats.totalAppointments || 0)}</h3>
          </div>
          <div className="thirdBox">
            <p>Registered Doctors</p>
            <h3>{loading ? <span style={{fontSize: "24px"}}>Loading...</span> : (stats.totalDoctors || 0)}</h3>
          </div>
          <div className="fourthBox">
            <p>Total Patients</p>
            <h3>{loading ? <span style={{fontSize: "24px"}}>Loading...</span> : (stats.totalPatients || 0)}</h3>
          </div>
        </div>
        <div className="banner stats-banner">
          <div className="stat-card pending">
            <h4>{loading ? <span style={{fontSize: "24px"}}>...</span> : (stats.pendingAppointments || 0)}</h4>
            <p>Pending Appointments</p>
          </div>
          <div className="stat-card accepted">
            <h4>{loading ? <span style={{fontSize: "24px"}}>...</span> : (stats.acceptedAppointments || 0)}</h4>
            <p>Accepted Appointments</p>
          </div>
          <div className="stat-card rejected">
            <h4>{loading ? <span style={{fontSize: "24px"}}>...</span> : (stats.rejectedAppointments || 0)}</h4>
            <p>Rejected Appointments</p>
          </div>
        </div>
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h5>Appointments</h5>
            <button 
              onClick={refreshData} 
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: loading ? "#ccc" : "#3939d9f2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
                <th>Visited</th>
              </tr>
            </thead>
            <tbody>
              {appointments && appointments.length > 0
                ? appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                      <td>{appointment.appointment_date.substring(0, 16)}</td>
                      <td>
                        <input
                          type="time"
                          value={appointment.appointment_time === "Not scheduled yet" ? "" : appointment.appointment_time}
                          onChange={(e) => handleUpdateTime(appointment._id, e.target.value)}
                          style={{
                            padding: "5px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "12px"
                          }}
                        />
                      </td>
                      <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
                      <td>{appointment.department}</td>
                      <td>
                        <select
                          className={
                            appointment.status === "Pending"
                              ? "value-pending"
                              : appointment.status === "Accepted"
                              ? "value-accepted"
                              : "value-rejected"
                          }
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="value-pending">
                            Pending
                          </option>
                          <option value="Accepted" className="value-accepted">
                            Accepted
                          </option>
                          <option value="Rejected" className="value-rejected">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td>{appointment.hasVisited === true ? <GoCheckCircleFill className="green"/> : <AiFillCloseCircle className="red"/>}</td>
                    </tr>
                  ))
                : "No Appointments Found!"}
            </tbody>
          </table>

          {}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
