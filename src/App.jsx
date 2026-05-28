import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import "@fortawesome/fontawesome-free/css/all.min.css";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

import BroadcastInterruption from "./components/layouts/BroadcastInterruption";

const Home = lazy(() => import("./pages/home/Home"));
const Options = lazy(() => import("./pages/options/Options"));
const Universe = lazy(() => import("./pages/universe/Universe"));
const Jukebox = lazy(() => import("./pages/jukebox/Jukebox"));
const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));
const Game = lazy(() => import("./pages/game/Game"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyGMSlots = lazy(() => import("./pages/mygm/MyGMSlots"));
const NewGame = lazy(() => import("./pages/mygm/NewGame"));
const Draft = lazy(() => import("./pages/mygm/Draft"));

import AdminRoute from "./components/auth/AdminRoute";
const AdminWrestlers = lazy(() => import("./pages/admin/AdminWrestlers"));

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<><BroadcastInterruption /><ProtectedLayout /></>}>
          <Route path="/" element={<Home />} />
          <Route path="/options" element={<Options />} />
          <Route path="/universe" element={<Universe />} />
          <Route path="/jukebox" element={<Jukebox />} />
          <Route path="/game" element={<Game />} />
          <Route path="/mygm" element={<MyGMSlots />} />
          <Route path="/mygm/new" element={<NewGame />} />
          <Route path="/mygm/draft/:sessionId" element={<Draft />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/wrestlers" element={<AdminWrestlers />} />
          </Route>
        </Route>
      </Route>

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}