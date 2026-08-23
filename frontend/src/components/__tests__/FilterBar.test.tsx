import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterBar from "../FilterBar";
import type { Filters } from "../../types";

const noFilters: Filters = { duration: "", category: [] };

describe("<FilterBar />", () => {
  it("renders one pill per selected category", () => {
    render(
      <FilterBar
        filters={{ duration: "12-20", category: ["Beaches", "Cycling"] }}
        onChange={vi.fn()}
      />
    );

    const list = document.getElementById("category-list")!;
    expect(list.children).toHaveLength(2);
    expect(screen.getByText("Beaches")).toBeInTheDocument();
    expect(screen.getByText("Cycling")).toBeInTheDocument();
  });

  it("shows the selected duration in the dropdown", () => {
    render(
      <FilterBar
        filters={{ duration: "2-6", category: [] }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Filter by duration")).toHaveValue("2-6");
  });

  it("reports a duration change", async () => {
    const onChange = vi.fn();
    render(<FilterBar filters={noFilters} onChange={onChange} />);

    await userEvent.selectOptions(
      screen.getByLabelText("Filter by duration"),
      "6-12"
    );

    expect(onChange).toHaveBeenCalledWith({ duration: "6-12", category: [] });
  });

  it("adds a category without duplicating it", async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={{ duration: "", category: ["Beaches"] }}
        onChange={onChange}
      />
    );

    await userEvent.selectOptions(screen.getByLabelText("Add category"), "Party");
    expect(onChange).toHaveBeenCalledWith({
      duration: "",
      category: ["Beaches", "Party"],
    });

    onChange.mockClear();
    await userEvent.selectOptions(
      screen.getByLabelText("Add category"),
      "Beaches"
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a category when its pill is clicked", async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={{ duration: "", category: ["Beaches", "Party"] }}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Beaches filter" })
    );

    expect(onChange).toHaveBeenCalledWith({
      duration: "",
      category: ["Party"],
    });
  });

  it("clears the duration and the categories independently", async () => {
    const onChange = vi.fn();
    const filters = { duration: "2-6", category: ["Beaches"] };
    render(<FilterBar filters={filters} onChange={onChange} />);

    const [clearDuration, clearCategory] = screen.getAllByRole("button", {
      name: "Clear",
    });

    await userEvent.click(clearDuration);
    expect(onChange).toHaveBeenCalledWith({
      duration: "",
      category: ["Beaches"],
    });

    await userEvent.click(clearCategory);
    expect(onChange).toHaveBeenCalledWith({ duration: "2-6", category: [] });
  });
});
