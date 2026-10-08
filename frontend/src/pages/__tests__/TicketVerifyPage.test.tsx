import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import TicketVerifyPage from "../TicketVerifyPage";
import { calledUrls, stubFetch } from "../../test/api";
import { renderWithProviders } from "../../test/render";

function renderAt(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/tickets/:reservationId" element={<TicketVerifyPage />} />
    </Routes>,
    { route, withAuth: false }
  );
}

const genuine = {
  valid: true,
  reference: "QT-3F9A21C4",
  status: "confirmed",
  adventureName: "Sunset Kayaking",
  city: "new-york",
  date: "2026-10-03",
  persons: 2,
  guest: "Robin R.",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TicketVerifyPage", () => {
  it("passes the signature from the QR code to the API", async () => {
    const fetchMock = stubFetch([["/verify", { body: genuine }]]);

    // Signatures are base64url, so "-" and "_" are the characters to carry.
    renderAt("/tickets/abc123?sig=Ab-_9zQ");

    await screen.findByText("Valid ticket");
    expect(calledUrls(fetchMock)).toContain("/api/v1/tickets/abc123/verify?sig=Ab-_9zQ");
  });

  it("shows what check-in needs for a genuine ticket", async () => {
    stubFetch([["/verify", { body: genuine }]]);

    renderAt("/tickets/abc123?sig=x");

    expect(await screen.findByRole("heading", { name: "Valid ticket" })).toBeInTheDocument();
    expect(screen.getByText("QT-3F9A21C4")).toBeInTheDocument();
    expect(screen.getByText("Sunset Kayaking")).toBeInTheDocument();
    expect(screen.getByText("Saturday, 3 October 2026")).toBeInTheDocument();
    expect(screen.getByText("Robin R.")).toBeInTheDocument();
    expect(screen.getByText("new york")).toBeInTheDocument();
  });

  it("warns against admitting a cancelled booking", async () => {
    stubFetch([["/verify", { body: { ...genuine, status: "cancelled" } }]]);

    renderAt("/tickets/abc123?sig=x");

    expect(await screen.findByRole("heading", { name: "Booking cancelled" })).toBeInTheDocument();
    expect(screen.getByText("This ticket should not be admitted.")).toBeInTheDocument();
  });

  it("rejects a code that does not verify", async () => {
    stubFetch([["/verify", { body: { valid: false } }]]);

    renderAt("/tickets/abc123?sig=forged");

    expect(await screen.findByRole("heading", { name: "Not a valid ticket" })).toBeInTheDocument();
    expect(screen.queryByText("Sunset Kayaking")).not.toBeInTheDocument();
  });
});
