import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { hasSession } from "./lib/session";
import { ChatPage } from "./pages/ChatPage";
import { ExplorePage } from "./pages/ExplorePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function ProtectedShellLayout() {
  return hasSession() ? <ShellLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={hasSession() ? "/app" : "/login"} replace />} />
      <Route
        path="/login"
        element={hasSession() ? <Navigate to="/app" replace /> : <LoginPage />}
      />
      <Route path="/app" element={<ProtectedShellLayout />}>
        <Route index element={<ExplorePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
