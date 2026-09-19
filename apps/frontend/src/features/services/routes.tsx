import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import ServicesPage from "./ServicesPage";
import BookService from "./BookService";

export function ServiceRoutes() {
  return (
    <>
      <Route path="/customer/services" element={<ProtectedRoute roles={["customer"]}><ServicesPage /></ProtectedRoute>} />
      <Route path="/customer/book-service/:id" element={<ProtectedRoute roles={["customer"]}><BookService /></ProtectedRoute>} />
    </>
  );
}
