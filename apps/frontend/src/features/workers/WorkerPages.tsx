import { Routes, Route, Navigate } from "react-router-dom";

import WorkerLogin from "@/features/auth/WorkerLogin";
import WorkerRegister from "@/features/auth/WorkerRegister";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Skills from "@/features/workers/WorkerSkills";
import Availability from "@/features/workers/WorkerAvailability";
import Dashboard from "@/features/workers/WorkerDashboard";
import Profile from "@/features/workers/WorkerProfile";
import Welfare from "@/features/workers/WorkerWelfare";
import Notifications from "@/features/workers/WorkerNotification";
import JobRequests from "@/features/bookings/WorkerJobRequests";
import JobDetails from "@/features/bookings/WorkerJobDetails";
import ActiveJob from "@/features/bookings/WorkerActiveJob";
import Earnings from "@/features/payments/WorkerEarnings";

function WorkerOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={["worker"]}>{children}</ProtectedRoute>;
}

export default function WorkerPages() {
  return (
    <Routes>
      <Route path="login" element={<WorkerLogin />} />
      <Route path="register" element={<WorkerRegister />} />
      <Route path="skills" element={<WorkerOnly><Skills /></WorkerOnly>} />
      <Route path="availability" element={<WorkerOnly><Availability /></WorkerOnly>} />
      <Route path="" element={<WorkerOnly><Dashboard /></WorkerOnly>} />
      <Route path="job-requests" element={<WorkerOnly><JobRequests /></WorkerOnly>} />
      <Route path="job-details/:id" element={<WorkerOnly><JobDetails /></WorkerOnly>} />
      <Route path="active-job/:id" element={<WorkerOnly><ActiveJob /></WorkerOnly>} />
      <Route path="earnings" element={<WorkerOnly><Earnings /></WorkerOnly>} />
      <Route path="profile" element={<WorkerOnly><Profile /></WorkerOnly>} />
      <Route path="welfare" element={<WorkerOnly><Welfare /></WorkerOnly>} />
      <Route path="notifications" element={<WorkerOnly><Notifications /></WorkerOnly>} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  );
}
