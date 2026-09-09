export function checkRequirement(value?: string): [revisedValue: string, isRequired: boolean] {
  const trimmedValue = value ? value.trim() : "";
  if (!trimmedValue) return ["", false];
  if (trimmedValue === "*") return ["", true];
  const matches = trimmedValue.match(/^(?<name>.+)\*$/);
  const isRequired = !!matches;
  const revisedValue = matches?.groups?.name.trim() ?? trimmedValue;
  return [revisedValue, isRequired];
}