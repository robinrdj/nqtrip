import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <NavBar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/*
            Keyed on pathname only — the query string carries filter state, and
            re-running the transition on every filter change would flicker the
            whole page instead of just updating the results.
          */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
