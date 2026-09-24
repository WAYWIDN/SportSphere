import { Routes, Route } from "react-router";

import Home from "./pages/Home.tsx";
import Venue from "./pages/Venue.tsx";
import Coach from "./pages/Coach.tsx";
import Game from "./pages/Game.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coach" element={<Coach />} />
      <Route path="/venue" element={<Venue />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}
