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
      
      <button type="button" data-testid="cancelBtn" onClick={() => ctx.submit("cancel")}>Cancel</button>
      <button type="button" data-testid="submitBtn" onClick={() => ctx.submit("submit", { payload: "payload" })}>Submit</button>
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

  test("submit sets action and automatically resets after fetch finishes", async () => {
    // 1. Create a controlled promise to handle the fetch resolution manually
    let resolveRefetch: (value: any) => void = () => {};
    const deferredPromise = new Promise((resolve) => {
      resolveRefetch = resolve;
    });

    // 2. Initialize your mock with a pending state configuration
    const { mockRefetch, updateMock } = mockUseFetch({
      data: null,
      loading: false,
      error: null,
    });
    
    // Intercept the call to return our custom promise and toggle loading to true
    mockRefetch.mockImplementation(() => {
      updateMock({ data: null, loading: true, error: null });
      return deferredPromise;
    });

    const input = getMockInput();
    const { rerender } = render(
      <FormContextProvider url="" inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formAction")).toBeNull();
    
    const cancel = screen.getByTestId("cancelBtn");
    act(() => fireEvent.click(cancel));

    let action = screen.queryByTestId("formAction");
    expect(action).not.toBeNull();
    expect(action!.innerHTML).toBe("cancel");
    expect(mockRefetch).toHaveBeenCalledExactlyOnceWith(undefined);

    await act(async () => {
      resolveRefetch(undefined);
      updateMock({ data: null, loading: false, error: null });
    });
    rerender(
      <FormContextProvider url="" inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );

    action = screen.queryByTestId("formAction");
    expect(action).toBeNull();
  });

  test("submit sets action to 'submit' and automatically resets after fetch finishes with payload", async () => {
    // 1. Create a controlled promise to handle the fetch resolution manually
    let resolveRefetch: (value: any) => void = () => {};
    const deferredPromise = new Promise((resolve) => {
      resolveRefetch = resolve;
    });

    // 2. Initialize your mock with a pending state configuration
    const { mockRefetch, updateMock } = mockUseFetch({
      data: null,
      loading: false,
      error: null,
    });
    
    // Intercept the call to return our custom promise and toggle loading to true
    mockRefetch.mockImplementation(() => {
      updateMock({ data: null, loading: true, error: null });
      return deferredPromise;
    });

    const input = getMockInput();
    const { rerender } = render(
      <FormContextProvider url="" inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );
    expect(screen.queryByTestId("formAction")).toBeNull();
    
    // 3. Select and click the submit button instead of cancel
    const submitBtn = screen.getByTestId("submitBtn");
    act(() => fireEvent.click(submitBtn));

    // 4. Verify the active state has transitioned to "submit"
    let action = screen.queryByTestId("formAction");
    expect(action).not.toBeNull();
    expect(action!.innerHTML).toBe("submit");
    
    // 5. Verify the refetch mock was called exactly with your expected custom payload
    expect(mockRefetch).toHaveBeenCalledExactlyOnceWith({ payload: "payload" });

    // 6. Resolve the pending network request
    await act(async () => {
      resolveRefetch(undefined);
      updateMock({ data: null, loading: false, error: null });
    });
    
    // 7. Force context re-render to propagate the hook state updates
    rerender(
      <FormContextProvider url="" inputs={{ test: input }}>
        <TestComponent />
      </FormContextProvider>
    );

    // 8. Assert everything successfully reverted back to null
    action = screen.queryByTestId("formAction");
    expect(action).toBeNull();
  });
  test("ensures custom headers are forwarded to the initial useFetch call", () => {
    // 1. Initialize your hook mock helper
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

    // 2. Render the provider with a custom URL and headers configuration
    render(
      <FormContextProvider 
        url="https://example.com" 
        headers={customHeaders} 
        inputs={{ test: input }}
      >
        <TestComponent />
      </FormContextProvider>
    );

    // 3. Assert that the hook module was called with exactly your properties
    // Argument 1: url, Argument 2: manual fetch flag (false), Argument 3: headers
    expect(spy).toHaveBeenCalledWith(
      "https://example.com",
      false,
      customHeaders
    );
  });
});
