import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LiveIndicator from "../../components/LiveIndicator";
import { makeAdventure } from "../../test/factories";
import { makeTestQueryClient } from "../../test/render";
import { keys } from "../queries";
import { useLiveAdventure } from "../useLiveAdventure";

/** A stand-in EventSource the test can push events through. */
class FakeEventSource {
  static instances: FakeEventSource[] = [];

  readonly url: string;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  private listeners = new Map<string, ((event: MessageEvent) => void)[]>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close() {
    this.closed = true;
  }

  // Test controls.
  open() {
    this.onopen?.();
  }

  emit(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// No default value: `setup(undefined)` has to mean "no id", not "the default".
function setup(adventureId: string | undefined) {
  const queryClient = makeTestQueryClient();
  queryClient.setQueryData(keys.adventures.detail("adv-1"), {
    adventure: makeAdventure({ capacity: 10, booked: 2, seatsLeft: 8 }),
    saved: false,
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const hook = renderHook(() => useLiveAdventure(adventureId), { wrapper });
  return { hook, queryClient, source: FakeEventSource.instances[0] };
}

describe("useLiveAdventure", () => {
  it("subscribes to the adventure's stream", () => {
    const { source } = setup("adv-1");
    expect(source?.url).toBe("/api/v1/adventures/adv-1/live");
  });

  it("writes seat updates into the cached adventure", () => {
    const { source, queryClient } = setup("adv-1");

    act(() => {
      source!.emit("seats", { adventureId: "adv-1", capacity: 10, booked: 10, seatsLeft: 0 });
    });

    const cached = queryClient.getQueryData<{ adventure: { seatsLeft: number; available: boolean } }>(
      keys.adventures.detail("adv-1")
    );
    expect(cached?.adventure).toMatchObject({ seatsLeft: 0, available: false });
  });

  it("reports connection state and the viewer count", () => {
    const { hook, source } = setup("adv-1");
    expect(hook.result.current).toEqual({ viewers: null, connected: false });

    act(() => {
      source!.open();
      source!.emit("viewers", { adventureId: "adv-1", count: 3 });
    });

    expect(hook.result.current).toEqual({ viewers: 3, connected: true });
  });

  it("closes the stream on unmount", () => {
    const { hook, source } = setup("adv-1");
    hook.unmount();
    expect(source!.closed).toBe(true);
  });

  it("does nothing without an id, or where EventSource does not exist", () => {
    setup(undefined);
    expect(FakeEventSource.instances).toHaveLength(0);

    vi.stubGlobal("EventSource", undefined);
    const { hook } = setup("adv-1");
    expect(hook.result.current).toEqual({ viewers: null, connected: false });
  });
});

describe("LiveIndicator", () => {
  it("counts only the other viewers", () => {
    render(<LiveIndicator connected viewers={3} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("2 others viewing now")).toBeInTheDocument();
  });

  it("does not describe the visitor to themselves", () => {
    render(<LiveIndicator connected viewers={1} />);
    expect(screen.queryByText(/viewing now/)).not.toBeInTheDocument();
  });

  it("is hidden while disconnected", () => {
    const { container } = render(<LiveIndicator connected={false} viewers={4} />);
    expect(container).toBeEmptyDOMElement();
  });
});
