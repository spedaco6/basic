export function checkRequirement(value?: string): [revisedValue: string, isRequired: boolean] {
  if (!value) return ["", false];
  if (value.trim() === "*") return ["", true];
  const matches = value?.match(/^(?<name>.+)\*$/);
  const isRequired = !!matches;
  const revisedValue = matches?.groups?.name ?? value;
  return [revisedValue, isRequired];
}