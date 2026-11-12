import React from "react";

type UseIdResult = string;

export const useId = (customId: (string | undefined), customLabel: (string | undefined)): UseIdResult => {
  let label = customLabel ?? "custom";
  let id = label + "_" + React.useId();
  if (customId) id = customId;
  return id;
}