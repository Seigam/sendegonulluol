import React from 'react';
import { createBrowserRouter, Outlet } from "react-router";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./components/Home";
import { EventDetail } from "./components/EventDetail";
import { Profile } from "./components/Profile";
import { OrganizerPanel } from "./components/OrganizerPanel";
import { AdminPanel } from "./components/AdminPanel";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "sonner";

function RootWithProvider() {
  return (
    <AppProvider>
      <Outlet />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootWithProvider,
    children: [
      {
        path: "/",
        Component: Login,
        index: true,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        Component: MainLayout,
        children: [
          { path: "home", Component: Home },
          { path: "event/:id", Component: EventDetail },
          { path: "profile", Component: Profile },
          { path: "organizer", Component: OrganizerPanel },
          { path: "admin", Component: AdminPanel },
        ]
      }
    ]
  }
]);
