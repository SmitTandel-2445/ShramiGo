import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import BookingConfirmation from "./BookingConfirmation";
import BookingTracking from "./BookingTracking";
import CustomerBookingHistory from "./CustomerBookingHistory";

export function BookingRoutes() {
  return (
    <>
      <Route path="/customer/booking-confirmation" element={<ProtectedRoute roles={["customer"]}><BookingConfirmation /></ProtectedRoute>} />
      <Route path="/customer/booking-tracking" element={<ProtectedRoute roles={["customer"]}><BookingTracking /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute roles={["customer"]}><CustomerBookingHistory /></ProtectedRoute>} />
    </>
  );
}
