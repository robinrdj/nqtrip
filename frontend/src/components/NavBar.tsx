import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

/** Where "back" should land when the visitor arrived by deep link. */
function fallbackFor(pathname: string): string {
  if (pathname.startsWith("/adventures/")) return "/adventures";
  return "/";
}

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // A "default" key means this is the first entry in the history stack, so
  // going back would leave the site entirely.
  const hasHistory = location.key !== "default";

  return (
    <button
      type="button"
      className="back-button"
      onClick={() =>
        hasHistory ? navigate(-1) : navigate(fallbackFor(location.pathname))
      }
      aria-label="Go back to the previous page"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="back-button-text">Back</span>
    </button>
  );
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const isHome = pathname === "/";

  // The header always has a border; scrolling only deepens the shadow.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      collapseOnSelect
      className={`app-header${scrolled ? " is-scrolled" : ""}`}
    >
      <Container>
        <div className="header-left">
          {!isHome && <BackButton />}

          <Navbar.Brand as={NavLink} to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span className="brand-text">
              <em>Q</em>Trip
            </span>
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="qtrip-nav" />
        <Navbar.Collapse id="qtrip-nav">
          <Nav className="app-nav ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/reservations">
              Reservations
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
