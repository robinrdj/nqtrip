import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdventuresPage from "../AdventuresPage";
import { calledUrls, stubFetch } from "../../test/api";
import { makeAdventure, makeAdventureList, makeCity } from "../../test/factories";
import { renderWithProviders } from "../../test/render";
import type { AdventureMapProps } from "../../components/map/AdventureMap";

// Leaflet needs a real layout engine; what matters here is what the page hands
// the map, not how Leaflet draws it.
vi.mock("../../components/map/LazyAdventureMap", () => ({
  default: (props: AdventureMapProps) => (
    <div data-testid="map">
      {props.adventures.map((a) => a.name).join(", ")}
      {props.fallbackCenter && ` @ ${props.fallbackCenter.lat},${props.fallbackCenter.lng}`}
    </div>
  ),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="search">{location.search}</output>;
}

let fetchMock: ReturnType<typeof stubFetch>;

beforeEach(() => {
  fetchMock = stubFetch([
    ["/cities", { body: { items: [makeCity({ location: { lat: 15.49, lng: 73.83 } })] } }],
    [
      "/adventures",
      {
        body: makeAdventureList([
          makeAdventure({ id: "a1", name: "Alpha" }),
          makeAdventure({ id: "a2", name: "Bravo" }),
        ]),
      },
    ],
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdventuresPage map view", () => {
  it("switches to the map and asks for every match at once", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <AdventuresPage />
        <LocationProbe />
      </>,
      { route: "/adventures?city=goa&page=2" }
    );

    await screen.findByRole("heading", { name: "Alpha" });
    await user.click(screen.getByRole("button", { name: "Map" }));

    expect(await screen.findByTestId("map")).toHaveTextContent("Alpha, Bravo @ 15.49,73.83");
    expect(screen.getByRole("button", { name: "Map" })).toHaveAttribute("aria-pressed", "true");
    // A page number means nothing on a map.
    expect(screen.getByTestId("search")).toHaveTextContent("?city=goa&view=map");

    await waitFor(() =>
      expect(calledUrls(fetchMock).some((u) => u.includes("city=goa&limit=60"))).toBe(true)
    );
  });

  it("keeps the map open when a filter changes", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <AdventuresPage />
        <LocationProbe />
      </>,
      { route: "/adventures?city=goa&view=map" }
    );

    await screen.findByTestId("map");
    await user.selectOptions(screen.getByLabelText("Sort by"), "price-asc");

    expect(screen.getByTestId("search")).toHaveTextContent("view=map");
    expect(screen.getByTestId("search")).toHaveTextContent("sort=price-asc");
  });

  it("goes back to the grid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdventuresPage />, { route: "/adventures?city=goa&view=map" });

    await screen.findByTestId("map");
    await user.click(screen.getByRole("button", { name: "Grid" }));

    expect(await screen.findByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  });
});
