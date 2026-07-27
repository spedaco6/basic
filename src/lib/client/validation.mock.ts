import { vi } from "vitest";

const createMockInstance = () => ({
  getErrors: vi.fn().mockReturnValue(null),
  validateByCode: vi.fn(),
  require: vi.fn(),
  email: vi.fn(),
});

export const mockValidationInstance = createMockInstance();
const mockValidator = vi.fn().mockImplementation(() => mockValidationInstance);
(mockValidator as any).REQUIRE = vi.fn();
(mockValidator as any).EMAIL = vi.fn();
(mockValidator as any).MIN = vi.fn();
(mockValidator as any).MAX = vi.fn();
(mockValidator as any).EQUALS = vi.fn();


vi.mock("./validation.ts", () => ({
  Validator: mockValidator
}));
