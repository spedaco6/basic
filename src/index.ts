import "./styles/main.css";

export { Input } from "./components/inputs/input/Input";
export { Button } from "./components/inputs/button/Button";

export { useInput } from "./hooks/useInput";
export { useFetch } from "./hooks/useFetch";
export { usePagination } from "./hooks/usePagination";

export { Validator } from "./lib/client/validation";

export type { InputProps } from "./components/inputs/input/Input";
export type { ButtonProps } from "./components/inputs/button/Button";

export type { UseInputResult, InputTypes } from "./hooks/useInput";
export type { UseFetchResult, FetchResponseData, RefetchFunction } from "./hooks/useFetch";
export type { UsePaginationResult, Pagination } from "./hooks/usePagination";

export type { ValidatorFn } from "./lib/client/validation";

