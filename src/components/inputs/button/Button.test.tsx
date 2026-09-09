import "@testing-library/jest-dom";
import { describe, expect, test } from "vitest";
import { Button } from "./Button";
import { render } from "@testing-library/react";

describe("Button element", () => {
  test("defaults to a button element with type 'button' and classes 'button' & 'primary'", () => {
    const { container } = render(<Button>Click Me!</Button>);
    const button = container.querySelector(".button.primary") as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button!.tagName).toBe("BUTTON");
    expect(button.disabled).toBe(false);
    expect(button.type).toBe("button");
  });
  test("disabled attr disables button and adds disabled class", () => {
    const { container } = render(<Button disabled>Click Me!</Button>);
    const button = container.querySelector(".button.primary.disabled") as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button.disabled).toBe(true);
    expect(button!.tagName).toBe("BUTTON");
  });
  test("custom variant added as css class", () => {
    const { container } = render(<Button variant="custom">Click Me!</Button>);
    const button = container.querySelector(".button.custom") as HTMLButtonElement;
    const button2 = container.querySelector(".button.primary") as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button2).not.toBeInTheDocument();
  });
  test("native inline style prop still works independently of variant", () => {
    // Regression guard: `variant` (formerly named `style`) used to collide
    // with React's native `style` prop, which made passing an actual
    // CSSProperties object fail to type-check. Confirms both props now
    // coexist correctly.
    const { container } = render(
      <Button variant="secondary" style={{ marginTop: "12px" }}>Click Me!</Button>
    );
    const button = container.querySelector(".button.secondary") as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button.style.marginTop).toBe("12px");
  });
  test("loading state does not show loading spinner by default", () => {
    const { container } = render(<Button loading>Click Me!</Button>);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });
  test("showLoading attr shows loading spinner when in loading state", () => {
    const { container, rerender } = render(<Button loading showLoading>Click Me!</Button>);
    let svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    rerender(<Button showLoading>Click Me!</Button>);
    svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });
});
