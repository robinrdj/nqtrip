import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import NavBar from "../NavBar";

/** Renders the header plus a probe that reports the current location. */
function renderAt(entries: string[], index?: number) {
  function Probe() {
    const location = useLocation();
    return <div data-testid="where">{location.pathname + location.search}</div>;
  }

  return render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <NavBar />
      <Routes>
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("<NavBar />", () => {
  it("renders the brand on every route", () => {
    renderAt(["/"]);
    expect(screen.getByText("Trip")).toBeInTheDocument();
  });

  it("hides the back button on the home page", () => {
    renderAt(["/"]);
    expect(screen.queryByLabelText(/go back/i)).not.toBeInTheDocument();
  });

  it("shows the back button on inner pages", () => {
    renderAt(["/adventures?city=goa"]);
    expect(screen.getByLabelText(/go back/i)).toBeInTheDocument();
  });

  it("returns to the previous page when there is history", async () => {
    renderAt(["/", "/adventures?city=goa", "/adventures/123"], 2);
    expect(screen.getByTestId("where")).toHaveTextContent("/adventures/123");

    await userEvent.click(screen.getByLabelText(/go back/i));

    expect(screen.getByTestId("where")).toHaveTextContent(
      "/adventures?city=goa"
    );
  });

  it("falls back to the adventures list when deep-linked to a detail page", async () => {
    // A single entry means there is nothing to go back to on this site.
    renderAt(["/adventures/123"]);

    await userEvent.click(screen.getByLabelText(/go back/i));

    expect(screen.getByTestId("where")).toHaveTextContent("/adventures");
  });

  it("falls back to home when deep-linked to reservations", async () => {
    renderAt(["/reservations"]);

    await userEvent.click(screen.getByLabelText(/go back/i));

    expect(screen.getByTestId("where")).toHaveTextContent("/");
  });

  it("marks the current route as active", () => {
    renderAt(["/reservations"]);

    expect(screen.getByRole("link", { name: "Reservations" })).toHaveClass(
      "active"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass(
      "active"
    );
  });
});
