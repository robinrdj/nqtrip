import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import BookingForm from "../BookingForm";
import { makeAdventure, makeReservation, makeUser } from "../../test/factories";
import { renderWithProviders } from "../../test/render";

/** Signed-in unless `user` is null; booking POSTs resolve with `booking`. */
function stubApi({
  user = makeUser(),
  booking,
}: {
  user?: ReturnType<typeof makeUser> | null;
  booking?: { status: number; payload: unknown };
} = {}) {
  const fetchMock = vi.fn((input: string, init?: RequestInit) => {
    const url = String(input);
    const json = (payload: unknown, status = 200) =>
      Promise.resolve(
        new Response(JSON.stringify(payload), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      );

    if (url.includes("/auth/me")) {
      return user
        ? json({ user })
        : json({ error: { message: "Not signed in" } }, 401);
    }

    if (url.includes("/reservations") && init?.method === "POST") {
      const result = booking ?? {
        status: 201,
        payload: { reservation: makeReservation() },
      };
      return json(result.payload, result.status);
    }

    return json({});
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("when signed out", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("asks the visitor to sign in, and remembers where to return them", async () => {
    stubApi({ user: null });

    renderWithProviders(<BookingForm adventure={makeAdventure({ id: "adv-9" })} />);

    const link = await screen.findByRole("link", { name: "Sign in to book" });
    expect(link).toHaveAttribute("href", "/login?next=%2Fadventures%2Fadv-9");
  });

  it("still shows the price", async () => {
    stubApi({ user: null });

    renderWithProviders(
      <BookingForm adventure={makeAdventure({ costPerHead: 1500 })} />
    );

    expect(await screen.findByText("₹1,500")).toBeInTheDocument();
  });
});

describe("when signed in", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("prefills the name from the account", async () => {
    stubApi({ user: makeUser({ name: "Robin Rajadurai" }) });

    renderWithProviders(<BookingForm adventure={makeAdventure()} />);

    await waitFor(() =>
      expect(screen.getByLabelText("Name on the booking")).toHaveValue(
        "Robin Rajadurai"
      )
    );
  });

  it("shows a running total as the party size changes", async () => {
    stubApi();
    const user = userEvent.setup();

    renderWithProviders(
      <BookingForm adventure={makeAdventure({ costPerHead: 1200 })} />
    );

    const persons = await screen.findByLabelText("How many people");
    await user.clear(persons);
    await user.type(persons, "3");

    expect(await screen.findByText("₹1,200 × 3 people")).toBeInTheDocument();
    // 1200 x 3, shown as the total as well as the line item.
    expect(screen.getAllByText("₹3,600").length).toBeGreaterThan(0);
  });

  it("rejects a past date without asking the server", async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();

    renderWithProviders(<BookingForm adventure={makeAdventure()} />);

    const date = await screen.findByLabelText("Date");
    // Set the value directly: typing into <input type="date"> is not reliable
    // in jsdom, and the rule under test is the schema's, not the widget's.
    fireEvent.change(date, { target: { value: "2020-01-01" } });
    await user.click(screen.getByRole("button", { name: /reserve your spot/i }));

    expect(
      await screen.findByText("You cannot book a date in the past.")
    ).toBeInTheDocument();

    const posts = fetchMock.mock.calls.filter(
      (call) => (call[1] as RequestInit | undefined)?.method === "POST"
    );
    expect(posts).toHaveLength(0);
  });

  it("confirms the booking once it succeeds", async () => {
    stubApi({
      booking: {
        status: 201,
        payload: { reservation: makeReservation({ price: 2400 }) },
      },
    });
    const user = userEvent.setup();

    renderWithProviders(<BookingForm adventure={makeAdventure()} />);

    await screen.findByLabelText("Date");
    await user.click(screen.getByRole("button", { name: /reserve your spot/i }));

    expect(await screen.findByText("You are booked")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View my trips" })).toBeInTheDocument();
  });

  it("shows the server's reason when the adventure sells out mid-booking", async () => {
    stubApi({
      booking: {
        status: 409,
        payload: { error: { message: "Only 2 seats are left for Sunset Kayaking." } },
      },
    });
    const user = userEvent.setup();

    renderWithProviders(<BookingForm adventure={makeAdventure()} />);

    await screen.findByLabelText("Date");
    await user.click(screen.getByRole("button", { name: /reserve your spot/i }));

    expect(
      await screen.findByText("Only 2 seats are left for Sunset Kayaking.")
    ).toBeInTheDocument();
  });

  it("attaches server-side field errors to the inputs that caused them", async () => {
    stubApi({
      booking: {
        status: 400,
        payload: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Some values are not valid.",
            details: [{ field: "name", message: "That name is too long." }],
          },
        },
      },
    });
    const user = userEvent.setup();

    renderWithProviders(<BookingForm adventure={makeAdventure()} />);

    await screen.findByLabelText("Date");
    await user.click(screen.getByRole("button", { name: /reserve your spot/i }));

    expect(await screen.findByText("That name is too long.")).toBeInTheDocument();
  });

  it("disables booking when the adventure is sold out", async () => {
    stubApi();

    renderWithProviders(
      <BookingForm adventure={makeAdventure({ seatsLeft: 0, available: false })} />
    );

    expect(await screen.findByRole("button", { name: "Sold out" })).toBeDisabled();
  });
});
