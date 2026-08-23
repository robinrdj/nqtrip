import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReservationForm from "../ReservationForm";
import type { AdventureDetail } from "../../types";

const adventure: AdventureDetail = {
  id: "6298356896",
  name: "Grand Dinyardlodge",
  subtitle: "This is a mind-blowing adventure!",
  images: ["https://example.com/one.jpeg"],
  content: "A random paragraph.",
  available: true,
  reserved: false,
  costPerHead: 1234,
};

function mockFetch(body: unknown, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    })
  );
}

// The form blocks past dates, so bookings in tests must be in the future.
const FUTURE_DATE = (() => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
})();

async function fillForm() {
  await userEvent.type(screen.getByLabelText("Name"), "Test Booking");
  await userEvent.type(screen.getByLabelText("Pick a Date"), FUTURE_DATE);

  const persons = screen.getByLabelText("Person(s)");
  await userEvent.clear(persons);
  await userEvent.type(persons, "2");
}

describe("<ReservationForm />", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the per-head cost", () => {
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    expect(document.getElementById("reservation-person-cost")).toHaveTextContent(
      "₹ 1234"
    );
  });

  it("recalculates the total as the person count changes", async () => {
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    const total = document.getElementById("reservation-cost")!;
    expect(total).toHaveTextContent("₹ 1234");

    const persons = screen.getByLabelText("Person(s)");
    await userEvent.clear(persons);
    await userEvent.type(persons, "3");

    expect(total).toHaveTextContent("₹ 3702");
  });

  it("POSTs the reservation with the entered details", async () => {
    const fetchSpy = mockFetch({ success: true });
    const onReserved = vi.fn();
    render(<ReservationForm adventure={adventure} onReserved={onReserved} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toEqual(expect.stringContaining("/reservations/new"));
    expect(init?.method).toEqual("POST");

    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      name: "Test Booking",
      date: FUTURE_DATE,
      person: "2",
      adventure: "6298356896",
    });

    await waitFor(() => expect(onReserved).toHaveBeenCalledTimes(1));
  });

  it("surfaces an error and does not report success when the booking fails", async () => {
    mockFetch({ success: false });
    const onReserved = vi.fn();
    render(<ReservationForm adventure={adventure} onReserved={onReserved} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not complete that reservation"
    );
    expect(onReserved).not.toHaveBeenCalled();
  });

  it("surfaces an error when the network call fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows the API’s own reason when the booking is rejected", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Date of booking is incorrect. Can’t book for a past date!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Can’t book for a past date"
    );
  });

  it("does not allow a date earlier than tomorrow, which the API rejects", () => {
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expected = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    expect(screen.getByLabelText("Pick a Date")).toHaveAttribute("min", expected);
  });

  it("does not submit while required fields are empty", async () => {
    const fetchSpy = mockFetch({ success: true });
    render(<ReservationForm adventure={adventure} onReserved={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
