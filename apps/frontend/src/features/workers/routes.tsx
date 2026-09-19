import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import SearchWorkers from "./SearchWorkers";
import WorkerDetails from "./WorkerDetails";
import WorkerPages from "./WorkerPages";

export function WorkerRoutes() {
  return (
    <>
      <Route path="/customer/search" element={<ProtectedRoute roles={["customer"]}><SearchWorkers /></ProtectedRoute>} />
      <Route path="/customer/worker/:id" element={<ProtectedRoute roles={["customer"]}><WorkerDetails /></ProtectedRoute>} />
      <Route path="/worker/*" element={<WorkerPages />} />
    </>
  );
}
