import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CityTile from "../CityTile";
import { renderWithRouter } from "../../test/render";

const london = {
  id: "london",
  city: "London",
  description: "300+ Places",
  image: "https://example.com/london.jpeg",
};

describe("<CityTile />", () => {
  it("renders the city name and description", () => {
    renderWithRouter(<CityTile city={london} />);

    expect(screen.getByRole("heading", { name: "London" })).toBeInTheDocument();
    expect(screen.getByText("300+ Places")).toBeInTheDocument();
  });

  it("renders an image labelled with the city name", () => {
    renderWithRouter(<CityTile city={london} />);

    expect(screen.getByRole("img", { name: "London" })).toHaveAttribute(
      "src",
      london.image
    );
  });

  it("links to the adventures page for that city", () => {
    renderWithRouter(<CityTile city={london} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/adventures?city=london"
    );
  });
});
