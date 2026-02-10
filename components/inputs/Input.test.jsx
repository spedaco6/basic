// @vitest-environment jsdom
import React from "react";
import { render, renderHook } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import { Input } from "./Input";
import { useInput } from "../../hooks/useInput";

describe("Input component", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.resetAllMocks())

  describe("default behavior", () => {
    test("creates div containing error, label, and input", () => {
      const { getByRole, getByText, getByTestId } = render(<Input 
        name="test" 
        label="Test Label" 
        error="Test error"
        disabled
      />);
      
      const div = getByTestId("input-container");
      const input = getByRole("textbox");
      const label = getByText("Test Label");
      const error = getByText("Test error");
  
      expect(div).toBeInTheDocument();
      expect(div).toContainElement(input);
      expect(div).toContainElement(label);
      expect(div).toContainElement(error);
  
      expect(input).toHaveAttribute("name", "test");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("disabled");
      expect(input).toBeInTheDocument();

      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "test");
      
      expect(error).toBeInTheDocument();
    });
  
    test("label for attribute is set to input id or name if id is not set", () => {
      const input1 = render(<Input name="test1" label="Input 1" />);
      const input2 = render(<Input name="test2" id="inputId" label="Input 2" /> );
  
      const label = input1.getByText("Input 1");
      const label2 = input2.getByText("Input 2");
  
      expect(label).toHaveAttribute("for", "test1");
      expect(label2).toHaveAttribute("for", "inputId");
    });
  
    test("asterisk is automatically added to label and placeholder when required is true", () => {
      const { getByRole, getByText } = render(<Input 
        name="test" 
        label="Test Label" 
        placeholder="Test placeholder"
        required
      />);
  
      const label = getByText("Test Label*");
      const input = getByRole("textbox");
  
      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Test placeholder*");
    });
  
    test("Label and error aren't there by default", () => {
      const { container } = render(<Input 
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
      const { getByLabelText } = render(<Input hook={hook.current} label="findMe" />);
      const input = getByLabelText("findMe*");
      expect(input).toHaveAttribute("name", "test");
      expect(input).toHaveValue("value");
      expect(input).toHaveAttribute("required");
    });

    test("attributes applied directly to Input supercede hook attributes", () => {
      const result = render(<Input hook={hook.current} name="updated" label="findMe" />);
      const input = result.getByLabelText("findMe*");
      expect(input).toHaveAttribute("name", "updated");
    });
  });
});