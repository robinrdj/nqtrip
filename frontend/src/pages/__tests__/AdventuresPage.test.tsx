import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdventuresPage from "../AdventuresPage";
import { makeAdventure, makeAdventureList, makeCity } from "../../test/factories";
import { renderWithProviders } from "../../test/render";

/**
 * Routes fetch calls by URL, so a page that fires several queries at once is
 * served the right payload for each without depending on call order.
 */
function stubApi(overrides: Record<string, unknown> = {}) {
  const fetchMock = vi.fn((input: string) => {
    const url = String(input);

    const body =
      url.includes("/auth/me")
        ? { status: 401, payload: { error: { message: "Not signed in" } } }
        : url.includes("/cities")
          ? { status: 200, payload: { items: [makeCity()] } }
          : url.includes("/adventures")
            ? { status: 200, payload: overrides.adventures ?? makeAdventureList() }
            : { status: 200, payload: {} };

    return Promise.resolve(
      new Response(JSON.stringify(body.payload), {
        status: body.status,
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AdventuresPage", () => {
  beforeEach(() => {
    stubApi();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the city name and result count", async () => {
    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    expect(await screen.findByRole("heading", { name: "Goa" })).toBeInTheDocument();
    expect(await screen.findByText("1 adventure to choose from")).toBeInTheDocument();
  });

  it("renders a card per adventure", async () => {
    stubApi({
      adventures: makeAdventureList([
        makeAdventure({ id: "a1", name: "Alpha" }),
        makeAdventure({ id: "a2", name: "Bravo" }),
      ]),
    });

    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    expect(await screen.findByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bravo" })).toBeInTheDocument();
  });

  it("sends the city filter to the API", async () => {
    const fetchMock = stubApi();

    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    await waitFor(() => {
      const called = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(called.some((url) => url.includes("/adventures?city=goa"))).toBe(true);
    });
  });

  it("asks the server to re-sort rather than sorting in the browser", async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();

    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    await screen.findByRole("heading", { name: "Goa" });
    await user.selectOptions(screen.getByLabelText("Sort by"), "price-asc");

    await waitFor(() => {
      const called = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(called.some((url) => url.includes("sort=price-asc"))).toBe(true);
    });
  });

  it("shows an empty state, and offers to clear the filters that caused it", async () => {
    stubApi({ adventures: makeAdventureList([], { total: 0 }) });

    renderWithProviders(<AdventuresPage />, {
      route: "/adventures?city=goa&category=Party",
    });

    expect(
      await screen.findByText("Nothing matches those filters")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear all filters" })
    ).toBeInTheDocument();
  });

  it("surfaces the API's error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string) =>
        Promise.resolve(
          String(input).includes("/adventures")
            ? new Response(
                JSON.stringify({ error: { message: "The catalogue is unavailable." } }),
                { status: 500, headers: { "Content-Type": "application/json" } }
              )
            : new Response(JSON.stringify({ items: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              })
        )
      )
    );

    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    expect(
      await screen.findByText("The catalogue is unavailable.")
    ).toBeInTheDocument();
  });

  it("hides pagination when everything fits on one page", async () => {
    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    await screen.findByRole("heading", { name: "Goa" });
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });

  it("pages through results", async () => {
    stubApi({
      adventures: makeAdventureList([makeAdventure()], { total: 50, totalPages: 3 }),
    });

    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    expect(await screen.findByText("Page 1 of 3")).toBeInTheDocument();
    // Nothing precedes page one.
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("invites an anonymous visitor to sign in", async () => {
    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa" });

    expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });
});
