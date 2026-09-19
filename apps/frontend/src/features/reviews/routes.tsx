import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Rating from "./Rating";

export function ReviewRoutes() {
  return (
    <Route path="/customer/rating" element={<ProtectedRoute roles={["customer"]}><Rating /></ProtectedRoute>} />
  );
}
