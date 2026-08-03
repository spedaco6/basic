import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mockUseFetch } from "../hooks/useFetch.mock";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { FormContextProvider, useFormCtx } from "./FormContext";
import { UseInputResult } from "../hooks/useInput";

const getMockInput = (alteredFields: Partial<UseInputResult> = {}) => ({
  id: "testId",
  name: "test",
  value: "", 
  required: true,
  errors: null,
  touched: false,
  ...alteredFields
} as UseInputResult);

const TestComponent = () => {
  const ctx = useFormCtx();
  return (
    <ul>
      <li data-testid="formId">{ ctx.id }</li>
      { ctx.loading && <li data-testid="formLoading"></li> }
      { ctx.disabled && <li data-testid="formDisabled"></li> }
      { ctx.error && <li data-testid="formError">{ ctx.error }</li> }
      { ctx.filled && <li data-testid="formFilled"></li> }
      { ctx.valid && <li data-testid="formValid"></li> }
      { ctx.action && <li data-testid="formAction">{ ctx.action }</li> }
      
      <button type="button" data-testid="cancelBtn">Cancel</button>
      <button type="button" data-testid="submitBtn">Submit</button>
    </ul>
  );
};

describe("FormContext", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.restoreAllMocks());

  test("auto-generates id", () => {
    const input = getMockInput();
    render(<FormContextProvider url="" inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    const data = screen.getByTestId("formId");
    expect(data.innerHTML).toBeTruthy();
  });

  test("id can be overwritten", () => {
    const input = getMockInput();
    render(<FormContextProvider url="" id="customId" inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    const data = screen.getByTestId("formId");
    expect(data.innerHTML).toBe("customId");
  });

  test("loading, disabled, and error passed through props", () => {
    const input = getMockInput();
    const { rerender } = render(<FormContextProvider url="" loading={true} disabled={true} error="Test error"  inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    
    expect(screen.queryByTestId("formLoading")).not.toBeNull();
    expect(screen.queryByTestId("formDisabled")).not.toBeNull();
    expect(screen.queryByTestId("formError")?.innerHTML).toBe("Test error");
    
    rerender(<FormContextProvider url="" inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    
    expect(screen.queryByTestId("formLoading")).toBeNull();
    expect(screen.queryByTestId("formDisabled")).toBeNull();
    expect(screen.queryByTestId("formError")).toBeNull();
  });

  test("filled is true when all required inputs have been touched", () => {
    const input1 = getMockInput({ id: "formId1" });
    const input2 = getMockInput({ id: "formId2" });
    const { rerender } = render(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    
    expect(screen.queryByTestId("formFilled")).toBeNull();
    
    input1.touched = true;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formFilled")).toBeNull();
    
    input2.touched = true;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formFilled")).not.toBeNull();
    
    input1.touched = false;
    input2.touched = false;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formFilled")).toBeNull();
    
    input1.required = false;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formFilled")).toBeNull();

    input2.required = false;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formFilled")).not.toBeNull();
  });

  test("valid is true when no inputs have errors", () => {
    const input1 = getMockInput({ id: "formId1", errors: "input1 error" });
    const input2 = getMockInput({ id: "formId2", errors: "input2 error", required: false });
    const { rerender } = render(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    
    expect(screen.queryByTestId("formValid")).toBeNull();

    input1.errors = null;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formValid")).toBeNull();

    input2.errors = null;
    rerender(<FormContextProvider url="" inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    expect(screen.queryByTestId("formValid")).not.toBeNull();
  });

  test("ensures custom headers are forwarded to the initial useFetch call", () => {
    const { spy } = mockUseFetch({
      data: null,
      loading: false,
      error: null,
    });

    const input = getMockInput();
    const customHeaders: HeadersInit = {
      "Authorization": "Bearer mock-token",
      "Content-Type": "application/json",
    };

    render(
      <FormContextProvider url="https://example.com" headers={customHeaders} inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );

    expect(spy).toHaveBeenCalledWith(
      "https://example.com",
      false,
      customHeaders
    );
  });

  test("manual error prop overrides useFetch hook errors", () => {
    mockUseFetch({
      data: null,
      loading: false,
      error: "API Server Error",
    });

    const input = getMockInput();
    
    render(
      <FormContextProvider url="" error="Manual Override Error" inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );

    const errorElement = screen.getByTestId("formError");
    expect(errorElement.innerHTML).toBe("Manual Override Error");
  });

  test("combines hook loading and prop loading statuses correctly", () => {
    const { updateMock } = mockUseFetch({ data: null, loading: true, error: null });
    const input = getMockInput();

    const { rerender } = render(
      <FormContextProvider url="" loading={false} inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formLoading")).not.toBeNull();

    act(() => {
      updateMock({ loading: false });
    });
    
    rerender(
      <FormContextProvider url="" loading={true} inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formLoading")).not.toBeNull();
  });

  test("filled is true when required inputs are touched even if optional inputs are untouched", () => {
    mockUseFetch();
    const requiredInput = getMockInput({ id: "req", required: true, touched: true });
    const optionalInput = getMockInput({ id: "opt", required: false, touched: false });

    render(
      <FormContextProvider url="" inputs={{ requiredInput, optionalInput }}>
        <TestComponent />
      </FormContextProvider>
    );

    expect(screen.queryByTestId("formFilled")).not.toBeNull();
  });

  test("disabled state toggles reactively based on props", () => {
    mockUseFetch();
    const input = getMockInput();

    const { rerender } = render(
      <FormContextProvider url="" disabled={true} inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formDisabled")).not.toBeNull();

    rerender(
      <FormContextProvider url="" disabled={false} inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formDisabled")).toBeNull();
  });

  test("useFormCtx throws a clear error when used outside of FormContextProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrowError(
      "useFormCtx must be used within a FormContextProvider."
    );

    consoleSpy.mockRestore();
  });

});
