import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Payment from "./Payment";
import Invoice from "./Invoice";

export function PaymentRoutes() {
  return (
    <>
      <Route path="/customer/payment/:id" element={<ProtectedRoute roles={["customer"]}><Payment /></ProtectedRoute>} />
      <Route path="/customer/invoice" element={<ProtectedRoute roles={["customer"]}><Invoice /></ProtectedRoute>} />
    </>
  );
}
