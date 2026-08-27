import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  LogOut,
  Menu,
  MountainSnow,
  Ticket,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "./ui/Button";
import ThemeToggle from "./ThemeToggle";

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
      onClick={() =>
        hasHistory ? navigate(-1) : navigate(fallbackFor(location.pathname))
      }
      aria-label="Go back to the previous page"
      className="grid size-9 place-items-center rounded-xl text-ink-soft transition hover:bg-surface-inset hover:text-ink"
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
    </button>
  );
}

const NAV_LINKS = [
  { to: "/", label: "Explore", end: true },
  { to: "/saved", label: "Saved" },
  { to: "/trips", label: "My trips" },
];

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-surface-inset"
          aria-label="Account menu"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
            {initials}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-xl border border-line bg-surface-raised p-1.5 shadow-panel data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item asChild>
            <Link
              to="/trips"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft outline-none data-[highlighted]:bg-surface-inset data-[highlighted]:text-ink"
            >
              <Ticket className="size-4" aria-hidden="true" />
              My trips
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              to="/saved"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft outline-none data-[highlighted]:bg-surface-inset data-[highlighted]:text-ink"
            >
              <Heart className="size-4" aria-hidden="true" />
              Saved
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              to="/account"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft outline-none data-[highlighted]:bg-surface-inset data-[highlighted]:text-ink"
            >
              <UserIcon className="size-4" aria-hidden="true" />
              Account
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item
            onSelect={async () => {
              await logout();
              navigate("/");
            }}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft outline-none data-[highlighted]:bg-surface-inset data-[highlighted]:text-ink"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Leaving the menu open across a navigation would cover the page just
  // arrived at.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = NAV_LINKS.filter(
    (link) => isAuthenticated || (link.to !== "/trips" && link.to !== "/saved")
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-200",
        scrolled
          ? "border-line bg-surface/85 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-surface"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {!isHome && <BackButton />}

        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
            <MountainSnow className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            <span className="text-brand-600">Q</span>Trip
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    // A shared layoutId slides the indicator between links
                    // rather than fading one out and another in.
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600"
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          <div className="hidden md:block">
            <AccountMenu />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-xl text-ink-soft transition hover:bg-surface-inset md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden border-t border-line bg-surface md:hidden"
        >
          <nav className="flex flex-col p-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-surface-inset text-ink"
                      : "text-ink-soft hover:bg-surface-inset"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-line pt-3">
              <AccountMenu />
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
