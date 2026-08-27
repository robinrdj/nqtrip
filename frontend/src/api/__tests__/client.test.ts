import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../client";
import { ApiError } from "../client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("request building", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("targets the v1 API", async () => {
    await api.fetchCities();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/cities");
  });

  it("sends cookies so the httpOnly session travels with the request", async () => {
    await api.fetchCities();
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("serialises filters into query params", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], savedIds: [] }));

    await api.fetchAdventures({
      city: "goa",
      category: ["Beaches", "Party"],
      durationMin: 2,
      durationMax: 6,
      sort: "price-asc",
      page: 2,
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("city=goa");
    expect(url).toContain("category=Beaches%2CParty");
    expect(url).toContain("durationMin=2");
    expect(url).toContain("durationMax=6");
    expect(url).toContain("sort=price-asc");
    expect(url).toContain("page=2");
  });

  it("omits empty values rather than sending blanks", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], savedIds: [] }));

    await api.fetchAdventures({ city: "goa", q: "", category: [] });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe("/api/v1/adventures?city=goa");
  });

  it("leaves the default sort and first page out of the URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], savedIds: [] }));

    await api.fetchAdventures({ city: "goa", sort: "recommended", page: 1 });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/adventures?city=goa");
  });

  it("encodes ids that would otherwise break the path", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ adventure: {}, saved: false }));

    await api.fetchAdventure("a/b?c");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/adventures/a%2Fb%3Fc");
  });

  it("posts a booking as JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reservation: {} }, 201));

    await api.createReservation({
      adventure: "adv-1",
      name: "Robin",
      date: "2099-01-15",
      persons: 2,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({
      adventure: "adv-1",
      name: "Robin",
      date: "2099-01-15",
      persons: 2,
    });
  });
});

describe("error handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces the API's human-readable message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: { code: "CONFLICT", message: "Only 2 seats are left." } },
          409
        )
      )
    );

    await expect(api.fetchCities()).rejects.toThrowError("Only 2 seats are left.");
  });

  it("collects per-field validation detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Some values are not valid.",
              details: [
                { field: "date", message: "You cannot book a date in the past." },
                { field: "persons", message: "At least one person." },
              ],
            },
          },
          400
        )
      )
    );

    const error = await api
      .createReservation({ adventure: "a", name: "R", date: "x", persons: 0 })
      .catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).fieldErrors).toEqual({
      date: "You cannot book a date in the past.",
      persons: "At least one person.",
    });
  });

  it("falls back to the status code when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>500</html>", { status: 500 }))
    );

    await expect(api.fetchCities()).rejects.toThrowError("Request failed (500)");
  });

  it("explains a network failure rather than leaking the raw error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(api.fetchCities()).rejects.toThrowError(/could not reach/i);
  });

  it("reports 401 as unauthorized", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { message: "You need to sign in." } }, 401)
      )
    );

    const error = await api.fetchCurrentUser().catch((err: unknown) => err);
    expect((error as ApiError).isUnauthorized).toBe(true);
  });
});

describe("token refresh", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes once and replays the original request", async () => {
    const fetchMock = vi
      .fn()
      // The original request, with an expired access token.
      .mockResolvedValueOnce(jsonResponse({ error: { message: "expired" } }, 401))
      // The refresh.
      .mockResolvedValueOnce(jsonResponse({ user: {} }))
      // The replay.
      .mockResolvedValueOnce(jsonResponse({ items: [{ id: "goa" }] }));

    vi.stubGlobal("fetch", fetchMock);

    const cities = await api.fetchCities();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/auth/refresh");
    expect(cities).toEqual([{ id: "goa" }]);
  });

  it("gives up after a failed refresh instead of looping", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { message: "expired" } }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: { message: "no session" } }, 401));

    vi.stubGlobal("fetch", fetchMock);

    await expect(api.fetchCities()).rejects.toThrowError();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not try to refresh a failed login", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ error: { message: "That email or password is not right." } }, 401)
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      api.login({ email: "a@b.com", password: "wrong" })
    ).rejects.toThrowError(/not right/);

    // A wrong password is not an expired session, so refreshing would be noise.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
