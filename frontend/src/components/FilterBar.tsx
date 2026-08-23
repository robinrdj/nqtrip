import Form from "react-bootstrap/Form";
import type { Filters } from "../types";

const DURATIONS = [
  { value: "0-2", label: "0-2 Hours" },
  { value: "2-6", label: "2-6 Hours" },
  { value: "6-12", label: "6-12 Hours" },
  { value: "12-99", label: "12+ Hours" },
];

const CATEGORIES = [
  { value: "Cycling", label: "Cycling Routes" },
  { value: "Hillside", label: "Hillside Getaways" },
  { value: "Beaches", label: "Serene Beaches" },
  { value: "Party", label: "Party Spots" },
];

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const addCategory = (category: string) => {
    if (category === "" || filters.category.includes(category)) return;
    onChange({ ...filters, category: [...filters.category, category] });
  };

  const removeCategory = (category: string) => {
    onChange({
      ...filters,
      category: filters.category.filter((item) => item !== category),
    });
  };

  return (
    <div className="mb-5">
      <div className="filter-bar d-flex align-items-center">
        <div className="filter-bar-tile">
          <Form.Label htmlFor="duration-select" className="mb-0">
            Filters:
          </Form.Label>
        </div>

        <div className="filter-bar-tile">
          <Form.Select
            id="duration-select"
            aria-label="Filter by duration"
            value={filters.duration}
            onChange={(event) =>
              onChange({ ...filters, duration: event.target.value })
            }
          >
            <option value="">Filter by Duration (Hours)</option>
            {DURATIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </Form.Select>
          <button
            type="button"
            className="filter-clear"
            onClick={() => onChange({ ...filters, duration: "" })}
          >
            Clear
          </button>
        </div>

        <div className="filter-bar-tile">
          <Form.Select
            id="category-select"
            aria-label="Add category"
            value=""
            onChange={(event) => addCategory(event.target.value)}
          >
            <option value="">Add Category</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Form.Select>
          <button
            type="button"
            className="filter-clear"
            onClick={() => onChange({ ...filters, category: [] })}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selected categories, each removable. */}
      <div className="mt-2" id="category-section">
        <div className="d-flex align-items-center flex-wrap" id="category-list">
          {filters.category.map((category) => (
            <button
              type="button"
              key={category}
              className="category-filter"
              onClick={() => removeCategory(category)}
              aria-label={`Remove ${category} filter`}
            >
              {category}
              <span aria-hidden="true" className="category-filter-remove">
                &times;
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
