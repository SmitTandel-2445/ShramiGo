import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import CustomerSplash from "./CustomerSplash";
import CustomerWelcome from "./CustomerWelcome";
import CustomerRoleSelection from "./CustomerRoleSelection";
import CustomerLogin from "./CustomerLogin";
import CustomerRegister from "./CustomerRegister";
import CustomerHome from "./CustomerHome";
import CustomerProfile from "./CustomerProfile";
import CustomerPages from "./CustomerPages";
import CustomerNotification from "./CustomerNotification";
import WorkerLogin from "./WorkerLogin";
import WorkerRegister from "./WorkerRegister";
import AdminLogin from "./AdminLogin";

export function AuthRoutes() {
  return (
    <>
      <Route path="/" element={<CustomerSplash />} />
      <Route path="/welcome" element={<CustomerWelcome />} />
      <Route path="/role-selection" element={<CustomerRoleSelection />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/customer" element={<ProtectedRoute roles={["customer"]}><CustomerHome /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute roles={["customer"]}><CustomerProfile /></ProtectedRoute>} />
      <Route path="/customer/pages/*" element={<ProtectedRoute roles={["customer"]}><CustomerPages /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute roles={["customer"]}><CustomerNotification /></ProtectedRoute>} />
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route path="/worker/register" element={<WorkerRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </>
  );
}
