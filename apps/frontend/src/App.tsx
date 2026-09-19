import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/app/providers/ThemeContext";
import { LanguageProvider } from "@/app/providers/LanguageContext";
import { AuthRoutes } from "@/features/auth";
import { ServiceRoutes } from "@/features/services";
import { WorkerRoutes } from "@/features/workers";
import { BookingRoutes } from "@/features/bookings";
import { PaymentRoutes } from "@/features/payments";
import { ReviewRoutes } from "@/features/reviews";
import { AdminRoutes } from "@/features/admin";
import { MatchingRoutes } from "@/features/matching";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {AuthRoutes()}
            {ServiceRoutes()}
            {WorkerRoutes()}
            {BookingRoutes()}
            {PaymentRoutes()}
            {ReviewRoutes()}
            {MatchingRoutes()}
            {AdminRoutes()}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
