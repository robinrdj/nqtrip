import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TripsPage from "../TripsPage";
import { calledUrls, stubFetch } from "../../test/api";
import { makeReservation, makeUser } from "../../test/factories";
import { renderWithProviders } from "../../test/render";

function stubTrips() {
  return stubFetch([
    ["/auth/me", { body: { user: makeUser() } }],
    [
      "/ticket",
      () => new Response(new Blob(["%PDF-1.3"], { type: "application/pdf" }), { status: 200 }),
    ],
    [
      "/reservations",
      {
        body: {
          items: [
            makeReservation({ id: "64b0000000000000abcdef12", adventureName: "Upcoming Trek" }),
            makeReservation({
              id: "res-cancelled",
              adventureName: "Called Off",
              status: "cancelled",
            }),
          ],
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
        },
      },
    ],
  ]);
}

beforeEach(() => {
  // jsdom implements neither; the download helper needs both.
  URL.createObjectURL = vi.fn(() => "blob:ticket");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TripsPage tickets", () => {
  it("shows the booking reference", async () => {
    stubTrips();
    renderWithProviders(<TripsPage />);

    expect(await screen.findByText(/QT-ABCDEF12/)).toBeInTheDocument();
  });

  it("offers a ticket only for bookings that still stand", async () => {
    stubTrips();
    renderWithProviders(<TripsPage />);

    const upcoming = (await screen.findByText("Upcoming Trek")).closest("article")!;
    const cancelled = screen.getByText("Called Off").closest("article")!;

    expect(within(upcoming).getByRole("button", { name: "Ticket" })).toBeInTheDocument();
    expect(within(cancelled).queryByRole("button", { name: "Ticket" })).not.toBeInTheDocument();
  });

  it("downloads the PDF through the API", async () => {
    const fetchMock = stubTrips();
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderWithProviders(<TripsPage />);
    const upcoming = (await screen.findByText("Upcoming Trek")).closest("article")!;
    await user.click(within(upcoming).getByRole("button", { name: "Ticket" }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(calledUrls(fetchMock)).toContain(
      "/api/v1/reservations/64b0000000000000abcdef12/ticket"
    );
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe("qtrip-ticket-QT-ABCDEF12.pdf");
  });
});
