import { vi } from "vitest";

export const mockValidationInstance = {
  value: "",
  name: undefined,
  errors: [] as string[],
  getErrors: vi.fn().mockReturnValue(null),
  require: vi.fn().mockReturnThis(),
  email: vi.fn().mockReturnThis(),
  min: vi.fn().mockReturnThis(),
  max: vi.fn().mockReturnThis(),
  equals: vi.fn().mockReturnThis(),
};

const mockValidatorConstructor = vi.fn().mockImplementation(function (val: any, name?: string) {
  mockValidationInstance.value = val;
  mockValidationInstance.name = name as any;
  return mockValidationInstance;
});

(mockValidatorConstructor as any).REQUIRE = vi.fn();
(mockValidatorConstructor as any).EMAIL = vi.fn();
(mockValidatorConstructor as any).MIN = vi.fn();
(mockValidatorConstructor as any).MAX = vi.fn();
(mockValidatorConstructor as any).EQUALS = vi.fn();

vi.mock("./validation.ts", () => ({
  Validator: mockValidatorConstructor,
}));
