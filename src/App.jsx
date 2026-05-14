import { Routes, Route } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

import BroadcastInterruption from "./components/layouts/BroadcastInterruption";

import Home from "./pages/home/Home";
import Options from "./pages/options/Options";
import Universe from "./pages/universe/Universe";
import Jukebox from "./pages/jukebox/Jukebox";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Game from "./pages/game/Game";
import NotFound from "./pages/NotFound";
import MyGMSlots from './pages/mygm/MyGMSlots';
import NewGame from './pages/mygm/NewGame';

import AdminRoute from "./components/auth/AdminRoute";
import AdminWrestlers from "./pages/admin/AdminWrestlers";

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
