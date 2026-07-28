import "./styles/main.css";

export { useInput } from "./hooks/useInput";
export { Input } from "./components/inputs/input/Input";
export { Validator } from "./lib/client/validation";

export type { UseInputResult } from "./hooks/useInput";
export type { ValidatorFn } from "./lib/client/validation";
export type { InputProps } from "./components/inputs/input/Input";