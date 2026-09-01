import { render, screen, userEvent } from "@test/test-utils";

import { Button } from ".";

it("runs the supplied action when activated", async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();

  render(<Button onClick={onClick}>Create a habit</Button>);
  await user.click(screen.getByRole("button", { name: "Create a habit" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});
