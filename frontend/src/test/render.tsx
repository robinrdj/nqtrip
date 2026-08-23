import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

/**
 * Renders a component inside a router, which every component using <Link> or
 * router hooks needs.
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = "/", ...options }: RenderOptions & { route?: string } = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    ),
    ...options,
  });
}
