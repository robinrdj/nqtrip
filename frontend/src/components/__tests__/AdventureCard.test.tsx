import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdventureCard from "../AdventureCard";
import { renderWithRouter } from "../../test/render";
import type { Adventure } from "../../types";

const adventure: Adventure = {
  id: "123456",
  name: "Niaboytown",
  costPerHead: 4003,
  currency: "INR",
  image: "https://example.com/park.jpeg",
  duration: 4,
  category: "Party",
};

describe("<AdventureCard />", () => {
  it("renders the name, cost and duration", () => {
    renderWithRouter(<AdventureCard adventure={adventure} />);

    expect(
      screen.getByRole("heading", { name: "Niaboytown" })
    ).toBeInTheDocument();
    expect(screen.getByText("\u20B9 4003")).toBeInTheDocument();
    expect(screen.getByText("4 hours")).toBeInTheDocument();
  });

  it("shows the category badge", () => {
    renderWithRouter(<AdventureCard adventure={adventure} />);

    expect(screen.getByText("Party")).toBeInTheDocument();
  });

  it("links to the matching adventure detail page", () => {
    renderWithRouter(<AdventureCard adventure={adventure} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/adventures/123456"
    );
  });
});
