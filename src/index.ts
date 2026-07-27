import "./styles/main.css";

export { useInput } from "@/hooks/useInput";
export { default as Input } from "@/components/inputs/input/Input";
export { default as Validator } from "@/lib/client/validation";

export type { UseInputResult } from "@/hooks/useInput";
export type { ValidatorFn } from "@/lib/client/validation";
export type { InputProps } from "@/components/inputs/input/Input";