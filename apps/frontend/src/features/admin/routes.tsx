import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminWorkers from "./AdminWorkers";
import AdminBookings from "./AdminBookings";
import AdminReports from "./AdminReports";
import AdminNotifications from "./AdminNotifications";

export function AdminRoutes() {
  return (
    <>
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/workers" element={<ProtectedRoute roles={["admin"]}><AdminWorkers /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={["admin"]}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute roles={["admin"]}><AdminNotifications /></ProtectedRoute>} />
    </>
  );
}
