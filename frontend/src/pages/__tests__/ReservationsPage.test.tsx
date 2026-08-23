import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReservationsPage from "../ReservationsPage";
import { renderWithRouter } from "../../test/render";
import type { Reservation } from "../../types";

const reservations: Reservation[] = [
  {
    name: "Test",
    date: "2020-11-05",
    person: "10",
    adventure: "2447910730",
    adventureName: "Niaboytown",
    price: 8006,
    id: "166e0e79d4efc2f8",
    time: "Wed Nov 04 2020 21:32:31 GMT+0530 (India Standard Time)",
  },
];

function mockReservations(body: Reservation[]) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

describe("<ReservationsPage />", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the table when reservations exist", async () => {
    mockReservations(reservations);
    renderWithRouter(<ReservationsPage />);

    expect(await screen.findByText("Niaboytown")).toBeInTheDocument();
    expect(document.getElementById("reservation-table")!.children).toHaveLength(
      1
    );
    expect(screen.queryByText(/not made any reservations/)).not.toBeInTheDocument();
  });

  it("shows the empty state when there are none", async () => {
    mockReservations([]);
    renderWithRouter(<ReservationsPage />);

    expect(
      await screen.findByText(/not made any reservations/)
    ).toBeInTheDocument();
    expect(document.getElementById("reservation-table")).not.toBeInTheDocument();
  });

  it("shows an error when reservations cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    renderWithRouter(<ReservationsPage />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
