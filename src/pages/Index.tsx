import { useApp } from "../context/AppContext";
import AuthPage from "./AuthPage";
import DaysConfigPage from "./DaysConfigPage";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, daysConfigured } = useApp();

  if (!isAuthenticated) return <AuthPage />;
  if (!daysConfigured) return <DaysConfigPage />;
  return <Navigate to="/chat" replace />;
};

export default Index;
