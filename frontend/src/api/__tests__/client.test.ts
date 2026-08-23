import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createReservation,
  fetchAdventureDetail,
  fetchAdventures,
  fetchCities,
  fetchReservations,
} from "../client";
import mockAdventuresData from "../../test/fixtures/adventures.json";
import mockCitiesData from "../../test/fixtures/cities.json";

function mockJsonResponse(body: unknown) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
}

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchCities()", () => {
    it("calls /cities and returns the cities array", async () => {
      const fetchSpy = mockJsonResponse(mockCitiesData);

      const data = await fetchCities();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/cities"),
        undefined
      );
      expect(fetchSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("//cities"),
        undefined
      );
      expect(data).toBeInstanceOf(Array);
      expect(data).toEqual(mockCitiesData);
    });

    it("throws an ApiError when the network call fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API failure"));

      await expect(fetchCities()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("fetchAdventures()", () => {
    it("calls /adventures with the city query param", async () => {
      const fetchSpy = mockJsonResponse(mockAdventuresData);

      const data = await fetchAdventures("bengaluru");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/adventures"),
        undefined
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("?city=bengaluru"),
        undefined
      );
      expect(data).toEqual(mockAdventuresData);
    });

    it("throws an ApiError when the network call fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API failure"));

      await expect(fetchAdventures("bengaluru")).rejects.toBeInstanceOf(
        ApiError
      );
    });

    it("throws an ApiError on a non-OK response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("nope", { status: 500 })
      );

      await expect(fetchAdventures("bengaluru")).rejects.toBeInstanceOf(
        ApiError
      );
    });

    it("surfaces the API’s own message on a rejected request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Date of booking is incorrect. Can’t book for a past date!",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      );

      await expect(fetchAdventures("bengaluru")).rejects.toThrow(
        "Date of booking is incorrect. Can’t book for a past date!"
      );
    });

    it("falls back to the status code when the body has no message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("not json", { status: 503 })
      );

      await expect(fetchAdventures("bengaluru")).rejects.toThrow(
        "Request failed (503)"
      );
    });
  });

  describe("fetchAdventureDetail()", () => {
    it("calls /adventures/detail with the adventure id", async () => {
      const fetchSpy = mockJsonResponse(mockAdventuresData[0]);

      const data = await fetchAdventureDetail("2447910730");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/adventures/detail?adventure=2447910730"),
        undefined
      );
      expect(data).toEqual(mockAdventuresData[0]);
    });

    it("throws an ApiError when the network call fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API failure"));

      await expect(fetchAdventureDetail("123")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("fetchReservations()", () => {
    it("calls /reservations and returns the data", async () => {
      const fetchSpy = mockJsonResponse([]);

      const data = await fetchReservations();

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/reservations"),
        undefined
      );
      expect(data).toEqual([]);
    });

    it("throws an ApiError when the network call fails", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("API failure"));

      await expect(fetchReservations()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("createReservation()", () => {
    it("POSTs the reservation as JSON", async () => {
      const fetchSpy = mockJsonResponse({ success: true });

      const result = await createReservation({
        name: "Test Booking",
        date: "2020-11-05",
        person: "2",
        adventure: "6298356896",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toEqual(expect.stringContaining("/reservations/new"));
      expect(init?.method).toEqual("POST");
      expect(JSON.stringify(init?.headers)).toEqual(
        JSON.stringify({ "Content-Type": "application/json" })
      );

      const body = JSON.parse(String(init?.body));
      expect(body).toHaveProperty("name");
      expect(body).toHaveProperty("date");
      expect(body).toHaveProperty("person");
      expect(body).toHaveProperty("adventure", "6298356896");

      expect(result).toEqual({ success: true });
    });
  });
});
