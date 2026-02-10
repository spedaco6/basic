// @vitest-environment jsdom
import React from "react";
import { render, renderHook } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import { Select } from "./Select";
import { useInput } from "../../hooks/useInput";

describe("Input component", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.resetAllMocks())

  describe("default behavior", () => {
    test("creates div containing error, label, and input", () => {
      const { getByRole, getByText, getByTestId } = render(<Select 
        name="test" 
        label="Test Label" 
        error="Test error"
        options={[
          { name: "Option 1", value: 1 },
          { name: "Option 2", value: 2 },
        ]}
        disabled
      />);
      
      const div = getByTestId("select-container");
      const select = getByRole("combobox");
      const label = getByText("Test Label");
      const error = getByText("Test error");
      const option1 = getByText("Option 1");
      const option2 = getByText("Option 2");
  
      expect(div).toBeInTheDocument();
      expect(div).toContainElement(select);
      expect(div).toContainElement(label);
      expect(div).toContainElement(error);
  
      expect(select).toHaveAttribute("name", "test");
      expect(select).toHaveAttribute("disabled");
      expect(select).toBeInTheDocument();
      expect(select).toContainElement(option1);
      expect(select).toContainElement(option2);

      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "test");
      
      expect(error).toBeInTheDocument();
    });
  
    test("label for attribute is set to input id or name if id is not set", () => {
      const select1 = render(<Select name="test1" label="Input 1" />);
      const select2 = render(<Select name="test2" id="inputId" label="Input 2" /> );
  
      const label = select1.getByText("Input 1");
      const label2 = select2.getByText("Input 2");
  
      expect(label).toHaveAttribute("for", "test1");
      expect(label2).toHaveAttribute("for", "inputId");
    });
  
    test("asterisk is automatically added to label when required is true", () => {
      const { getByText } = render(<Select 
        name="test" 
        label="Test Label" 
        required
      />);
  
      const label = getByText("Test Label*");  
      expect(label).toBeInTheDocument();
    });
  
    test("Label and error aren't there by default", () => {
      const { container } = render(<Select 
        name="test" 
      />);
  
      const label = container.querySelector("label");
      const error = container.querySelector("p");
  
      expect(label).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
    });
  });
  
  describe("useInput hook behavior", () => {
    let hook;
    beforeEach(() => {
      hook = renderHook(() => useInput("test*", "value")).result;
    });

    test("hook sets name, required, value, onChange, onBlur", () => {
      const { getByLabelText } = render(<Select 
        hook={hook.current} 
        label="findMe" 
        options={[
          { name: "Option 1", value: "value" },
          { name: "Option 2", value: "otherValue" },
        ]}
      />);
      const select = getByLabelText("findMe*");
      expect(select).toHaveAttribute("name", "test");
      expect(select).toHaveAttribute("required");
      expect(select).toHaveValue("value");
    });

    test("attributes applied directly to Input supercede hook attributes", () => {
      const result = render(<Select hook={hook.current} name="updated" label="findMe" />);
      const select = result.getByLabelText("findMe*");
      expect(select).toHaveAttribute("name", "updated");
    });
  });
});