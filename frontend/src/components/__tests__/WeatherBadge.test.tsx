import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WeatherBadge from "../WeatherBadge";
import { calledUrls, stubFetch } from "../../test/api";
import { renderWithProviders } from "../../test/render";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WeatherBadge", () => {
  it("shows the day's forecast, and flags a likely-wet day", async () => {
    const fetchMock = stubFetch([
      [
        "/weather",
        {
          body: {
            forecast: {
              available: true,
              date: "2026-10-02",
              condition: "rain",
              summary: "Rain showers",
              tempMax: 31,
              tempMin: 24,
              precipitationChance: 70,
            },
          },
        },
      ],
    ]);

    renderWithProviders(<WeatherBadge city="goa" date="2026-10-02" />, { withAuth: false });

    expect(await screen.findByText(/Rain showers · 31°\/24°C/)).toBeInTheDocument();
    expect(screen.getByText(/70% rain/)).toBeInTheDocument();
    expect(calledUrls(fetchMock)).toContain("/api/v1/weather?city=goa&date=2026-10-02");
  });

  it("does not mention rain when it is unlikely", async () => {
    stubFetch([
      [
        "/weather",
        {
          body: {
            forecast: {
              available: true,
              date: "2026-10-02",
              condition: "clear",
              summary: "Clear sky",
              tempMax: 30,
              tempMin: 22,
              precipitationChance: 5,
            },
          },
        },
      ],
    ]);

    renderWithProviders(<WeatherBadge city="goa" date="2026-10-02" />, { withAuth: false });

    expect(await screen.findByText(/Clear sky/)).toBeInTheDocument();
    expect(screen.queryByText(/% rain/)).not.toBeInTheDocument();
  });

  it("renders nothing when there is no forecast for the day", async () => {
    const fetchMock = stubFetch([
      ["/weather", { body: { forecast: { available: false, date: "2027-05-01", reason: "out-of-range" } } }],
    ]);

    const { container } = renderWithProviders(
      <WeatherBadge city="goa" date="2027-05-01" />,
      { withAuth: false }
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing, rather than an error, when the request fails", async () => {
    const fetchMock = stubFetch([["/weather", { status: 500, body: {} }]]);

    const { container } = renderWithProviders(
      <WeatherBadge city="goa" date="2026-10-02" />,
      { withAuth: false }
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("does not ask until it knows both the city and the date", () => {
    const fetchMock = stubFetch([]);

    renderWithProviders(<WeatherBadge city="goa" date="" />, { withAuth: false });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
