import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdventureDetailPage from "./pages/AdventureDetailPage";
import AdventuresPage from "./pages/AdventuresPage";
import LandingPage from "./pages/LandingPage";
import ReservationsPage from "./pages/ReservationsPage";

function NotFoundPage() {
  return (
    <div className="container">
      <div className="content">
        <h1 className="page-heading">Page not found</h1>
        <p className="page-subheading">
          That page does not exist. <Link to="/">Back to all cities</Link>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adventures" element={<AdventuresPage />} />
        <Route path="/adventures/:adventureId" element={<AdventureDetailPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
