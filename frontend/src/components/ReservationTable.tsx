import { Link } from "react-router-dom";
import { formatAdventureDate, formatBookingTime } from "../lib/format";
import type { Reservation } from "../types";

export default function ReservationTable({
  reservations,
}: {
  reservations: Reservation[];
}) {
  return (
    <div id="reservation-table-parent">
      <table className="table align-middle">
        <thead>
          <tr>
            <th scope="col">Transaction ID</th>
            <th scope="col">Booking Name</th>
            <th scope="col">Adventure</th>
            <th scope="col">Person(s)</th>
            <th scope="col">Date</th>
            <th scope="col">Price</th>
            <th scope="col">Booking Time</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody id="reservation-table">
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{reservation.name}</td>
              <td>{reservation.adventureName}</td>
              <td>{reservation.person}</td>
              <td>{formatAdventureDate(reservation.date)}</td>
              <td>{reservation.price}</td>
              <td>{formatBookingTime(reservation.time)}</td>
              <td>
                <Link
                  className="reservation-visit-button"
                  to={`/adventures/${reservation.adventure}`}
                >
                  Visit Adventure
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
