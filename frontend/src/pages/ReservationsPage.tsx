import { Link } from "react-router-dom";
import { fetchReservations } from "../api/client";
import ReservationTable from "../components/ReservationTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ReservationsPage() {
  const { data: reservations, loading, error } = useAsync(fetchReservations, []);

  useDocumentTitle("Your reservations");

  return (
    <div className="container">
      <div className="content">
        <h1 className="page-heading">Your Reservations</h1>
        <p className="page-subheading">
          {reservations && reservations.length > 0
            ? `You have ${reservations.length} booking${reservations.length === 1 ? "" : "s"}.`
            : "Everything you have booked so far."}
        </p>

        {loading && <LoadingState label="Loading reservations…" />}
        {error && <ErrorState message={error} />}

        {reservations &&
          (reservations.length === 0 ? (
            <EmptyState>
              Oops! You have not made any reservations yet! (Click{" "}
              <Link to="/">
                <strong>here</strong>
              </Link>{" "}
              to explore some cities)
            </EmptyState>
          ) : (
            <ReservationTable reservations={reservations} />
          ))}
      </div>
    </div>
  );
}
