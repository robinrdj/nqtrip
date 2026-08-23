import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReservationTable from "../ReservationTable";
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
  {
    name: "Test2",
    date: "2021-01-01",
    person: "1",
    adventure: "2447910731",
    adventureName: "Random Adventure",
    price: 1234,
    id: "52cs0v79f4afcaf8",
    time: "Wed Nov 04 2020 20:30:59 GMT+0530 (India Standard Time)",
  },
];

describe("<ReservationTable />", () => {
  it("renders one row per reservation", () => {
    renderWithRouter(<ReservationTable reservations={reservations} />);

    const body = document.getElementById("reservation-table")!;
    expect(within(body).getAllByRole("row")).toHaveLength(reservations.length);
  });

  it("renders each reservation's details in order", () => {
    renderWithRouter(<ReservationTable reservations={reservations} />);

    const rows = within(
      document.getElementById("reservation-table")!
    ).getAllByRole("row");

    reservations.forEach((reservation, index) => {
      const cells = within(rows[index]).getAllByRole("cell");
      expect(cells[0]).toHaveTextContent(reservation.id);
      expect(cells[1]).toHaveTextContent(reservation.name);
      expect(cells[2]).toHaveTextContent(reservation.adventureName);
      expect(cells[3]).toHaveTextContent(reservation.person);
      expect(cells[5]).toHaveTextContent(String(reservation.price));
    });
  });

  it("formats the adventure date and the booking time", () => {
    renderWithRouter(<ReservationTable reservations={reservations} />);

    const rows = within(
      document.getElementById("reservation-table")!
    ).getAllByRole("row");

    expect(within(rows[0]).getAllByRole("cell")[4]).toHaveTextContent(
      "5/11/2020"
    );
    expect(within(rows[0]).getAllByRole("cell")[6]).toHaveTextContent(
      "4 November 2020, 9:32:31 pm"
    );
    expect(within(rows[1]).getAllByRole("cell")[4]).toHaveTextContent(
      "1/1/2021"
    );
    expect(within(rows[1]).getAllByRole("cell")[6]).toHaveTextContent(
      "4 November 2020, 8:30:59 pm"
    );
  });

  it("links each row to its adventure", () => {
    renderWithRouter(<ReservationTable reservations={reservations} />);

    const links = screen.getAllByRole("link", { name: "Visit Adventure" });
    expect(links[0]).toHaveAttribute("href", "/adventures/2447910730");
    expect(links[1]).toHaveAttribute("href", "/adventures/2447910731");
  });
});
