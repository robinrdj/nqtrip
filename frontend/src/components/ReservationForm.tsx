import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { ApiError, createReservation } from "../api/client";
import { addDays, formatCurrency, toDateInputValue } from "../lib/format";
import type { AdventureDetail } from "../types";

interface ReservationFormProps {
  adventure: AdventureDetail;
  onReserved: () => void;
}

export default function ReservationForm({
  adventure,
  onReserved,
}: ReservationFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = adventure.costPerHead * (Number.isFinite(persons) ? persons : 0);

  // The API rejects bookings that are not in the future, so don't offer today
  // or anything earlier in the picker.
  const earliestDate = toDateInputValue(addDays(new Date(), 1));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await createReservation({
        name,
        date,
        person: String(persons),
        adventure: adventure.id,
      });

      if (!result.success) {
        setError("We could not complete that reservation. Please try again.");
        return;
      }

      // Re-fetch the adventure so the reserved banner and availability update.
      onReserved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not complete that reservation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reservation-panel-available">
      <Form id="myForm" onSubmit={handleSubmit}>
        <Form.Label htmlFor="name">Name</Form.Label>
        <Form.Control
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <Form.Label htmlFor="date" className="mt-3">
          Pick a Date
        </Form.Label>
        <Form.Control
          type="date"
          id="date"
          name="date"
          min={earliestDate}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <hr />
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="m-0">
              <Form.Label htmlFor="person" className="m-0">
                Person(s)
              </Form.Label>
            </h6>
            <p className="m-0 text-secondary" style={{ fontSize: "0.9rem" }}>
              <span id="reservation-person-cost">
                {formatCurrency(adventure.costPerHead)}
              </span>{" "}
              per head
            </p>
          </div>
          <div>
            <Form.Control
              type="number"
              id="person"
              name="person"
              min={1}
              max={10}
              style={{ width: "100px" }}
              value={persons}
              onChange={(event) => setPersons(Number(event.target.value))}
              required
            />
          </div>
        </div>

        <hr />
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="m-0">Total</h6>
          <h5 className="m-0 total-amount" id="reservation-cost">
            {formatCurrency(total)}
          </h5>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}

        <button className="reserve-button" type="submit" disabled={submitting}>
          {submitting ? "Reserving…" : "Reserve"}
        </button>
      </Form>
    </div>
  );
}
