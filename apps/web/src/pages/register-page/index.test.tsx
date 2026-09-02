import { screen, waitFor } from "@test/test-utils";
import { render, userEvent } from "@test/test-utils";

import { RegisterPage } from ".";

describe("RegisterPage", () => {
  it("shows client-side validation without submitting invalid values", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Use at least 8 characters.")).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps the form and displays a server error", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "An account with this email already exists.",
        },
      }),
    } as Response);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "valid password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("An account with this email already exists."),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Create account" }),
      ).toBeEnabled(),
    );
    expect(screen.getByLabelText("Email")).toHaveValue("person@example.com");
  });
});
