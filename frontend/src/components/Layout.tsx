import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
