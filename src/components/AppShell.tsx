import type { PropsWithChildren } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { appContent, navItems } from "../data/appContent";
import {
  ChatIcon,
  GridIcon,
  HomeIcon,
  ProfileIcon
} from "./icons";
import { logoutUser } from "../lib/api";
import { clearSession, getSession } from "../lib/session";

const navIcons = {
  "/app": HomeIcon,
  "/app/chat": ChatIcon,
  "/app/profile": ProfileIcon,
  "/app/admin": GridIcon
};

const routeEyebrows = {
  "/app": "Volunteer Discovery",
  "/app/chat": "Live Coordination",
  "/app/profile": "Volunteer Identity",
  "/app/admin": "Community Management"
} as const;

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const routeVariant =
    location.pathname === "/app"
      ? "home"
      : location.pathname === "/app/chat"
        ? "chat"
        : location.pathname === "/app/profile"
          ? "profile"
          : location.pathname === "/app/admin"
            ? "home"
          : "default";
  const eyebrow =
    routeEyebrows[location.pathname as keyof typeof routeEyebrows] ??
    appContent.shell.tagline;
  const shellClassName =
    routeVariant === "home"
      ? "app-shell app-shell-home"
      : routeVariant === "chat"
        ? "app-shell app-shell-chat"
        : routeVariant === "profile"
          ? "app-shell app-shell-profile"
        : "app-shell";
  const frameClassName =
    routeVariant === "home"
      ? "device-frame device-frame-home"
      : routeVariant === "chat"
        ? "device-frame device-frame-chat"
        : routeVariant === "profile"
          ? "device-frame device-frame-profile"
        : "device-frame";
  const screenClassName =
    routeVariant === "home"
      ? "device-screen device-screen-home"
      : routeVariant === "chat"
        ? "device-screen device-screen-chat"
        : routeVariant === "profile"
          ? "device-screen device-screen-profile"
        : "device-screen";
  const layoutClassName =
    routeVariant === "home"
      ? "screen-layout screen-layout-home"
      : routeVariant === "chat"
        ? "screen-layout screen-layout-chat"
        : routeVariant === "profile"
          ? "screen-layout screen-layout-profile"
        : "screen-layout";
  const mainClassName =
    routeVariant === "home"
      ? "screen-main screen-main-home"
      : routeVariant === "chat"
        ? "screen-main screen-main-chat"
        : routeVariant === "profile"
          ? "screen-main screen-main-profile"
        : "screen-main";
  const contentClassName =
    routeVariant === "home"
      ? "screen-content screen-content-home"
      : routeVariant === "chat"
        ? "screen-content screen-content-chat"
        : routeVariant === "profile"
          ? "screen-content screen-content-profile"
        : "screen-content";
  const visibleNavItems = session?.isAdmin ? navItems : navItems.filter((item) => item.path !== "/app/admin");

  return (
    <div className={shellClassName}>
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className={frameClassName}>
        {routeVariant === "default" ? <div className="device-notch" /> : null}
        <div className={screenClassName}>
          <div className={layoutClassName}>
            <nav className="bottom-nav" aria-label="Main navigation">
              <div className="sidebar-brand">
                <span className="eyebrow">Volunteer Platform</span>
                <strong>{appContent.shell.title}</strong>
              </div>

              {visibleNavItems.map((item) => {
                const Icon = navIcons[item.path];

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? "nav-item is-active" : "nav-item"
                    }
                  >
                    <span className="nav-icon-wrap">
                      <Icon className="nav-icon" />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <button
                className="nav-item nav-item-logout"
                type="button"
                onClick={async () => {
                  try {
                    await logoutUser();
                  } catch {
                    // Prototype logout should still succeed locally even if the request fails.
                  } finally {
                    clearSession();
                    navigate("/login");
                  }
                }}
              >
                <span className="nav-icon-wrap">X</span>
                <span>Logout</span>
              </button>
            </nav>

            <div className={mainClassName}>
              {routeVariant === "default" ? (
                <header className="screen-header">
                  <div>
                    <span className="eyebrow">{eyebrow}</span>
                    <h2>{appContent.shell.title}</h2>
                  </div>
                  <span className="status-pill">Day 1 Web Prototype</span>
                </header>
              ) : null}

              <section className={contentClassName}>{children}</section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
