import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
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
  return <ul>
    <li data-testid="formId">{ ctx.id }</li>
    { ctx.loading && <li data-testid="formLoading"></li> }
    { ctx.submitting && <li data-testid="formSubmitting"></li> }
    { ctx.disabled && <li data-testid="formDisabled"></li> }
    { ctx.error && <li data-testid="formError">{ ctx.error }</li> }
    { ctx.filled && <li data-testid="formFilled"></li> }
    { ctx.valid && <li data-testid="formValid"></li> }
  </ul>
}

describe("FormContext", () => {
  test("auto-generates id", () => {
    const input = getMockInput();
    render(<FormContextProvider inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    const data = screen.getByTestId("formId");
    expect(data.innerHTML).toBeTruthy();
  });
  test("id can be overwritten", () => {
    const input = getMockInput();
    render(<FormContextProvider id="customId" inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    const data = screen.getByTestId("formId");
    expect(data.innerHTML).toBe("customId");
  });
  test("loading, disabled, submitting, and error passed through props", () => {
    const input = getMockInput();
    const { rerender } = render(<FormContextProvider loading={true} submitting={true} disabled={true} error="Test error"  inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    let loading = screen.queryByTestId("formLoading");
    let submitting = screen.queryByTestId("formSubmitting");
    let disabled = screen.queryByTestId("formDisabled");
    let error = screen.queryByTestId("formError");
    expect(loading).not.toBeNull();
    expect(submitting).not.toBeNull();
    expect(disabled).not.toBeNull();
    expect(error?.innerHTML).toBe("Test error");
    
    rerender(<FormContextProvider inputs={{ test: input }}>
      <TestComponent />
    </FormContextProvider>);
    loading = screen.queryByTestId("formLoading");
    submitting = screen.queryByTestId("formSubmitting");
    disabled = screen.queryByTestId("formDisabled");
    error = screen.queryByTestId("formError");
    expect(loading).toBeNull();
    expect(submitting).toBeNull();
    expect(disabled).toBeNull();
    expect(error).toBeNull();
  });

  test("filled is true when all required inputs have been touched", () => {
    const input1 = getMockInput({ id: "formId1" });
    const input2 = getMockInput({ id: "formId2" });
    const { rerender } = render(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    let filled = screen.queryByTestId("formFilled");
    expect(filled).toBeNull();
    
    input1.touched = true;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    filled = screen.queryByTestId("formFilled");
    expect(filled).toBeNull();
    
    input2.touched = true;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    filled = screen.queryByTestId("formFilled");
    expect(filled).not.toBeNull();
    
    input1.touched = false;
    input2.touched = false;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    filled = screen.queryByTestId("formFilled");
    expect(filled).toBeNull();
    
    input1.required = false;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    filled = screen.queryByTestId("formFilled");
    expect(filled).toBeNull();

    input2.required = false;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    filled = screen.queryByTestId("formFilled");
    expect(filled).not.toBeNull();
  });

  test("valid is true when no inputs have errors", () => {
    const input1 = getMockInput({ id: "formId1", errors: "input1 error" });
    const input2 = getMockInput({ id: "formId2", errors: "input2 error", required: false });
    const { rerender } = render(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    let valid = screen.queryByTestId("formValid");
    expect(valid).toBeNull();

    input1.errors = null;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    valid = screen.queryByTestId("formValid");
    expect(valid).toBeNull();

    input2.errors = null;
    rerender(<FormContextProvider inputs={{ input1, input2 }}>
      <TestComponent />
    </FormContextProvider>);
    valid = screen.queryByTestId("formValid");
    expect(valid).not.toBeNull();
  });
});