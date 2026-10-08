import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoogleSignInButton from "../GoogleSignInButton";
import { calledUrls, stubFetch } from "../../test/api";
import { makeUser } from "../../test/factories";
import { renderWithProviders } from "../../test/render";
import type { GoogleIdentity } from "../../lib/googleIdentity";

// Google's script is replaced by a fake that captures what we hand it.
const gis = vi.hoisted(() => ({
  initialize: vi.fn(),
  renderButton: vi.fn(),
}));

vi.mock("../../lib/googleIdentity", () => ({
  loadGoogleIdentity: () =>
    Promise.resolve({ accounts: { id: gis } } as unknown as GoogleIdentity),
}));

beforeEach(() => {
  gis.initialize.mockReset();
  gis.renderButton.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleSignInButton", () => {
  it("renders nothing when the server has Google sign-in switched off", async () => {
    const fetchMock = stubFetch([
      ["/auth/providers", { body: { password: true, google: { enabled: false } } }],
    ]);

    const { container } = renderWithProviders(<GoogleSignInButton onSignedIn={vi.fn()} />);

    await waitFor(() => expect(calledUrls(fetchMock).some((u) => u.includes("/auth/providers"))).toBe(true));
    expect(container).toBeEmptyDOMElement();
    expect(gis.initialize).not.toHaveBeenCalled();
  });

  it("initialises Google with the client id the server advertises", async () => {
    stubFetch([
      ["/auth/providers", { body: { password: true, google: { enabled: true, clientId: "cid-123" } } }],
    ]);

    renderWithProviders(<GoogleSignInButton onSignedIn={vi.fn()} intent="signup" />);

    await waitFor(() => expect(gis.renderButton).toHaveBeenCalled());
    expect(gis.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "cid-123", ux_mode: "popup" })
    );
    expect(gis.renderButton.mock.calls[0]![1]).toMatchObject({ text: "signup_with" });
    expect(screen.getByText("or with email")).toBeInTheDocument();
  });

  it("exchanges Google's credential for a session", async () => {
    const user = makeUser({ name: "Google Traveller" });
    const fetchMock = stubFetch([
      ["/auth/providers", { body: { password: true, google: { enabled: true, clientId: "cid" } } }],
      ["/auth/google", { body: { user } }],
    ]);
    const onSignedIn = vi.fn();

    renderWithProviders(<GoogleSignInButton onSignedIn={onSignedIn} />);
    await waitFor(() => expect(gis.initialize).toHaveBeenCalled());

    // What Google does once the visitor picks an account.
    const { callback } = gis.initialize.mock.calls[0]![0] as {
      callback: (r: { credential: string }) => void;
    };
    callback({ credential: "google-id-token" });

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(user));
    const googleCall = fetchMock.mock.calls.find((c) => String(c[0]).includes("/auth/google"));
    expect(JSON.parse(String(googleCall![1]?.body))).toEqual({
      credential: "google-id-token",
    });
  });

  it("shows the server's reason when the sign-in is refused", async () => {
    stubFetch([
      ["/auth/providers", { body: { password: true, google: { enabled: true, clientId: "cid" } } }],
      [
        "/auth/google",
        { status: 401, body: { error: { message: "Your Google account's email is not verified." } } },
      ],
    ]);

    renderWithProviders(<GoogleSignInButton onSignedIn={vi.fn()} />);
    await waitFor(() => expect(gis.initialize).toHaveBeenCalled());

    const { callback } = gis.initialize.mock.calls[0]![0] as {
      callback: (r: { credential: string }) => void;
    };
    callback({ credential: "t" });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your Google account's email is not verified."
    );
  });
});
