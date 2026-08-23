import { useCallback, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link, useParams } from "react-router-dom";
import { fetchAdventureDetail } from "../api/client";
import PhotoCarousel from "../components/PhotoCarousel";
import ReservationForm from "../components/ReservationForm";
import { ErrorState, LoadingState } from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatCurrency } from "../lib/format";

export default function AdventureDetailPage() {
  const { adventureId = "" } = useParams();

  // Bumped after a successful booking to re-run the fetch, so the reserved
  // banner and availability reflect the new state.
  const [reloadToken, setReloadToken] = useState(0);
  const handleReserved = useCallback(() => setReloadToken((n) => n + 1), []);

  const {
    data: adventure,
    loading,
    error,
  } = useAsync(
    () => fetchAdventureDetail(adventureId),
    [adventureId, reloadToken]
  );

  useDocumentTitle(adventure?.name);

  if (loading) {
    return (
      <div className="container">
        <div className="content">
          <LoadingState label="Loading adventure…" />
        </div>
      </div>
    );
  }

  if (error || !adventure) {
    return (
      <div className="container">
        <div className="content">
          <ErrorState message={error ?? "Adventure not found."} />
          <Link to="/">Back to all cities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content">
        {adventure.reserved && (
          <Alert variant="success" id="reserved-banner">
            Greetings! Reservation for this adventure is successful. (Click{" "}
            <Alert.Link as={Link} to="/reservations">
              <strong>here</strong>
            </Alert.Link>{" "}
            to view your reservations)
          </Alert>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="adventure-detail-card mb-3">
              <h1 id="adventure-name">{adventure.name}</h1>
              <p className="page-subheading mb-3" id="adventure-subtitle">
                {adventure.subtitle}
              </p>

              <div className="adventure-meta">
                <span className="meta-chip">
                  {formatCurrency(adventure.costPerHead)} per head
                </span>
              </div>

              <div className="mb-4">
                <PhotoCarousel images={adventure.images} alt={adventure.name} />
              </div>

              <hr className="section-divider" />
              <h5 className="mb-3">About the Experience</h5>
              <div className="adventure-content" id="adventure-content">
                {adventure.content}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="booking-panel">
              {adventure.available ? (
                <ReservationForm
                  adventure={adventure}
                  onReserved={handleReserved}
                />
              ) : (
                <div id="reservation-panel-sold-out">
                  <h3>Sold Out!</h3>
                  <hr />
                  This activity is currently sold out. But there&rsquo;s a lot
                  more to <Link to="/">explore.</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
