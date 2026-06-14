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
const Dashboard = lazy(() => import("./pages/mygm/Dashboard"));
const Roster = lazy(() => import("./pages/mygm/Roster"));
const FreeAgents = lazy(() => import("./pages/mygm/FreeAgents"));
const Rivalries = lazy(() => import("./pages/mygm/Rivalries"));
const TagTeams = lazy(() => import("./pages/mygm/TagTeams"));
const Standings = lazy(() => import("./pages/mygm/Standings"));
const Logistics = lazy(() => import("./pages/mygm/Logistics"));
const BookShow = lazy(() => import("./pages/mygm/BookShow"));
const RunShow = lazy(() => import("./pages/mygm/RunShow"));
const SeasonFinale = lazy(() => import("./pages/mygm/SeasonFinale"));

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
          <Route path="/mygm/dashboard/:sessionId" element={<Dashboard />} />
          <Route path="/mygm/roster/:sessionId" element={<Roster />} />
          <Route path="/mygm/free-agents/:sessionId" element={<FreeAgents />} />
          <Route path="/mygm/rivalries/:sessionId" element={<Rivalries />} />
          <Route path="/mygm/tagteams/:sessionId" element={<TagTeams />} />
          <Route path="/mygm/standings/:sessionId" element={<Standings />} />
          <Route path="/mygm/logistics/:sessionId" element={<Logistics />} />
          <Route path="/mygm/book-show/:sessionId" element={<BookShow />} />
          <Route path="/mygm/run-show/:sessionId" element={<RunShow />} />
          <Route path="/mygm/finale/:sessionId" element={<SeasonFinale />} />

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