import { Route } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AIRecommendations from "./AIRecommendations";

export function MatchingRoutes() {
  return (
    <Route
      path="/customer/recommendations"
      element={<ProtectedRoute roles={["customer"]}><AIRecommendations /></ProtectedRoute>}
    />
  );
}
