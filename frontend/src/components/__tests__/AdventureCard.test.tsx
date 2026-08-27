import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdventureCard from "../AdventureCard";
import { makeAdventure } from "../../test/factories";
import { renderWithRouter } from "../../test/render";

describe("AdventureCard", () => {
  it("shows the name, price, duration and category", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ name: "Sunset Kayaking", costPerHead: 1200, duration: 4 })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Sunset Kayaking" })).toBeInTheDocument();
    expect(screen.getByText("₹1,200")).toBeInTheDocument();
    expect(screen.getByText("4h")).toBeInTheDocument();
    expect(screen.getByText("Beaches")).toBeInTheDocument();
  });

  it("links to the detail page", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ id: "adv-99" })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/adventures/adv-99");
  });

  it("reports the saved state to assistive technology", () => {
    renderWithRouter(
      <AdventureCard adventure={makeAdventure()} saved onToggleSave={vi.fn()} />
    );

    const button = screen.getByRole("button", { name: /remove .* from your list/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggleSave with the adventure id", async () => {
    const onToggleSave = vi.fn();
    const user = userEvent.setup();

    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ id: "adv-7" })}
        saved={false}
        onToggleSave={onToggleSave}
      />
    );

    await user.click(screen.getByRole("button", { name: /save .* to your list/i }));

    expect(onToggleSave).toHaveBeenCalledWith("adv-7");
  });

  it("marks a sold-out adventure", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ seatsLeft: 0, booked: 10, available: false })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("warns when only a few seats remain", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ seatsLeft: 2 })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("Only 2 seats left")).toBeInTheDocument();
  });

  it("uses the singular for a single remaining seat", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ seatsLeft: 1 })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("Only 1 seat left")).toBeInTheDocument();
  });

  it("does not warn when there is plenty of room", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ seatsLeft: 9 })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.queryByText(/seats left/)).not.toBeInTheDocument();
    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("announces an unrated adventure as new rather than as zero stars", () => {
    renderWithRouter(
      <AdventureCard
        adventure={makeAdventure({ ratingAverage: 0, ratingCount: 0 })}
        saved={false}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText("New")).toBeInTheDocument();
  });
});
