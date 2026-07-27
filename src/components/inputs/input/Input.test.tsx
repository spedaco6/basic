import "@testing-library/jest-dom";
import { expect, test, describe } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Input from "./Input";

let counter = 0;
function getTestId() {
  const num = counter;
  counter++;
  return "Sample" + num;
}
describe("Input element", () => {
 
  test("id generated automatically", () => {
    const name = getTestId();
    render(<Input 
      data-testid={name}
    />);
    let input = screen.getByTestId(name) as HTMLInputElement;
    const id = input.getAttribute("id");
    expect(id).toBeDefined();
  });
  test("generated id contains name attribute when provided", () => {
    const name = getTestId();
    render(<Input 
      data-testid={name}
      name="Sample"
    />);
    let input = screen.getByTestId(name) as HTMLInputElement;
    const id = input.getAttribute("id");
    expect(id).toContain("Sample_");
  });
  
  test.each([
    "",
    0,
  ])("value is set by '%s' value", (val) => {
    const name = getTestId();
      render(<Input 
        data-testid={name}
        value={val}
        onChange={() => {}}
        label={name}
        name="Name*"
      />);
      let input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.value).toBe(String(val));
  });
  describe("required", () => {
    test("when name includes trailing asterisk", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        label={name}
        name="Name*"
      />);
      let input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.required).toBe(true);
      
      rerender(<Input 
        data-testid={name}
        name="Name"
      />);
      input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.required).toBe(false);
    });
    test("when required attribute is set", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        label={name}
        name="Name"
        required
      />);
      let input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.required).toBe(true);
      
      rerender(<Input 
        data-testid={name}
        name="Name"
      />);
      input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.required).toBe(false);
    });

    test("name attribute does not include asterisk", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        label={name}
        name="Name*"
      />);
      const input = screen.getByTestId(name);
      expect(input.getAttribute("name")).toBe("Name");
    });
  })

  describe("label attribute", () => {
    test("automatically includes asterisk required and label attributes are provided", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        label={name}
        name="Name*"
      />);
      let label: HTMLElement | null = screen.getByText(name + "*");
      
      expect(label.textContent).toBe(name + "*");
    
      rerender(<Input 
        data-testid={name}
        name="Name*"
      />);
      label = screen.queryByText("*");
      expect(label).toBeNull();
      
      rerender(<Input 
        data-testid={name}
        name="Name"
        required
      />);
      label = screen.queryByText("*");
    
      expect(label).toBeNull();
    
      rerender(<Input 
        data-testid={name}
        label={name}
        name="Name"
        required
      />);
      label = screen.getByText(name + "*");
      expect(label.textContent).toBe(name + "*");
    });

    test("hideAsterisk removes asterisk from required label", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        label={name}
        name="Name*"
        hideAsterisk
      />);
      let label: HTMLElement | null = screen.queryByText(name+"*");      
      expect(label).toBeNull();

      rerender(<Input 
        data-testid={name}
        label={name}
        name="Name"
        required
        hideAsterisk
      />);
      label = screen.queryByText(name + "*");
      expect(label).toBeNull();
    });

    test("defaults to 'top' when no position is provided", () => {
      const name = getTestId();
      render(<Input 
        data-testid={name}
        label={name}
      />);
      let input = screen.getByTestId(name);
      let label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    test("appears before input for 'top'/'left' and after input for 'bottom'/'right'", () => {
      const name = getTestId();
      const {rerender} = render(<Input 
        data-testid={name}
        labelPosition="top"
        label={name}
      />);
      let input = screen.getByTestId(name);
      let label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  
      rerender(<Input 
        data-testid={name}
        labelPosition="left"
        label={name}
      />);
      input = screen.getByTestId(name);
      label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  
      rerender(<Input 
        data-testid={name}
        labelPosition="right"
        label={name}
      />);
      input = screen.getByTestId(name);
      label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  
      rerender(<Input 
        data-testid={name}
        labelPosition="bottom"
        label={name}
      />);
      input = screen.getByTestId(name);
      label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    });

    test("'for' attribute is set to custom id attribute or auto-generated id", () => {
      const testId = getTestId();
      const { rerender } = render(<Input 
        data-testid={testId}
        label={testId}
      />);
      const input = screen.getByTestId(testId) as HTMLInputElement;
      const label = screen.getByText(testId);
      const id = input.getAttribute("id");
      const htmlFor = label.getAttribute("for");
      expect(id).toBe(htmlFor);

      rerender(<Input 
        data-testid={testId}
        id="custom"
        label={testId}
      />);

      const htmlFor2 = label.getAttribute("for");
      expect("custom").toBe(htmlFor2);
    });
  });

  describe("errors", () => {
    test("no error element displays when error is empty", () => {
      const name = getTestId();
      const { container } = render(<Input 
        data-testid={name}
        labelPosition="top"
        label={name}
        errors=""
      />);

      const inputContainer = container.firstChild as HTMLElement;
      const error = screen.queryByRole("paragraph");
      expect(error).toBeNull();
      expect(inputContainer.classList.contains("error")).toBe(false);
    });

    test("displays after input element when error is provided", () => {
      const name = getTestId();
      const msg = "An error occurred";
      const { container } = render(<Input 
        data-testid={name}
        labelPosition="top"
        label={name}
        errors={msg}
      />);

      const inputContainer = container.firstChild as HTMLElement;
      const input = screen.getByTestId(name);
      const error = screen.getByText(msg);
      expect(input.compareDocumentPosition(error)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(inputContainer.classList.contains("error")).toBe(true);
    });

    test("accepts string and string arrays", () => {
      const msg1 = "Custom error";
      const msg2 = "Another custom error"; 
      const { rerender } = render(<Input 
        errors={[msg1, msg2]}
      />);

      let error1 = screen.getByText(msg1);
      let error2 = screen.getByText(msg2);
      expect(error1).toBeDefined();
      expect(error2).toBeDefined();
      
      rerender(<Input errors={msg1} />);
      
      error1 = screen.getByText(msg1);
      error2 = screen.queryByText(msg2) as HTMLElement;
      expect(error1).toBeDefined();
      expect(error2).toBeNull();
    });

    test("adds error class to parent container", () => {
      const { container } = render(<Input 
        errors="An error occurred"
      />);
      const input = container.querySelector(".input.error");
      expect(input).toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    test("disables input", () => {
      const name = getTestId();
      render(<Input 
        data-testid={name}
        labelPosition="top"
        label={name}
        disabled
      />);
      const input = screen.getByTestId(name) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    test("adds disabled class to parent container", () => {
      const { container } = render(<Input 
        disabled
      />);
      const input = container.querySelector(".input.disabled");
      expect(input).toBeInTheDocument();
    });
  });

  describe("checkbox", () => {
    test("label displays after input element by default", () => {
      const name = getTestId();
      render(<Input 
        data-testid={name}
        type="checkbox"
        label={name}
      />);
      let input = screen.getByTestId(name);
      let label = screen.getByText(name);
      expect(label.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    });
    test("checkboxStyle attribute added to input container as a class", () => {
      const name = getTestId();
      const { container } = render(<Input 
        checkboxStyle="sampleStyle"
        data-testid={name}
        type="checkbox"
        label={name}
      />);
      const inputContainer = container.querySelector(".checkbox.sampleStyle");
      const input = container.querySelector("input");
      const label = container.querySelector("label");
      expect(inputContainer).toContainElement(input);
      expect(inputContainer).toContainElement(label);
    });
  });

  describe("hook behavior", () => {
    test("hook sets id, name, value, onChange, onBlur, required, errors, and onReset", () => {
      const changeSpy = vi.fn();
      const blurSpy = vi.fn();
      const resetSpy = vi.fn();
      const mockHook = {
        id: "hookId",
        name: "hookName",
        value: "hookValue",
        required: true,
        errors: "A hook error occurred",
        onChange: changeSpy,
        onBlur: blurSpy,
        onReset: resetSpy,
        touched: true,
      };
      const testId = getTestId();
      render(<Input hook={mockHook} data-testid={testId} />);
      const input = screen.getByTestId(testId) as HTMLInputElement;
      const error = screen.getByText("A hook error occurred");

      expect(input.getAttribute("id")).toBe("hookId");
      expect(input.getAttribute("name")).toBe("hookName");
      expect(input.getAttribute("value")).toBe("hookValue");
      expect(input.required).toBe(true);
      expect(error).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "event" }});
      expect(changeSpy).toHaveBeenCalled();
      fireEvent.blur(input);
      expect(blurSpy).toHaveBeenCalled();
    });
    test("hook values are overwritten by attributes", () => {
      const changeSpy = vi.fn();
      const blurSpy = vi.fn();
      const resetSpy = vi.fn();
      const mockHook = {
        id: "hookId",
        name: "hookName",
        value: "hookValue",
        required: false,
        errors: "A hook error occurred",
        onChange: changeSpy,
        onBlur: blurSpy,
        onReset: resetSpy,
        touched: true,
      };
      const testId = getTestId();
      render(<Input 
        hook={mockHook} 
        data-testid={testId} 
        id="attrId"
        name="attrName"
        errors="An attribute error occurred"
        required={true}
        value="attrValue"
        onChange={() => {}}
        onBlur={() => {}}
      />);
      const input = screen.getByTestId(testId) as HTMLInputElement;
      const noError = screen.queryByText("A hook error occurred");
      const error = screen.getByText("An attribute error occurred");

      expect(input.getAttribute("id")).toBe("attrId");
      expect(input.getAttribute("name")).toBe("attrName");
      expect(input.getAttribute("value")).toBe("attrValue");
      expect(input.required).toBe(true);
      expect(noError).not.toBeInTheDocument();
      expect(error).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "event" }});
      expect(changeSpy).not.toHaveBeenCalled();
      fireEvent.blur(input);
      expect(blurSpy).not.toHaveBeenCalled();
    });
    test("required hook, name, or attribute results in a required input", () => {
      const mockHook = {
        id: "hookId",
        name: "hookName",
        value: "hookValue",
        required: true,
        errors: "A hook error occurred",
        onChange: () => {},
        onBlur: () => {},
        onReset: () => {},
        touched: true,
      };
      const testId = getTestId();
      render(<Input 
        hook={mockHook} 
        data-testid={testId}
        required={false}
      />);
      const input = screen.getByTestId(testId) as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    test("falsy attributes do not overwrite hook values", () => {
      const changeSpy = vi.fn();
      const blurSpy = vi.fn();
      const resetSpy = vi.fn();
      const mockHook = {
        id: "hookId",
        name: "hookName",
        value: "hookValue",
        required: true,
        errors: "A hook error occurred",
        onChange: changeSpy,
        onBlur: blurSpy,
        onReset: resetSpy,
        touched: true,
      };
      const testId = getTestId();
      render(<Input 
        hook={mockHook} 
        data-testid={testId} 
        name=""
        id=""
        errors={null}
      />);
      const input = screen.getByTestId(testId) as HTMLInputElement;
      const error = screen.getByText("A hook error occurred");

      expect(input.getAttribute("id")).toBe("hookId");
      expect(input.getAttribute("name")).toBe("hookName");
      expect(input.getAttribute("value")).toBe("hookValue");
      expect(input.required).toBe(true);
      expect(error).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "event" }});
      expect(changeSpy).toHaveBeenCalled();
      fireEvent.blur(input);
      expect(blurSpy).toHaveBeenCalled();
    });
  });
});
