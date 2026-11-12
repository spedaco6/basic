import React from "react";

type UseIdResult = string;

export const useId = (customId?: string, label?: string): UseIdResult => {
  let id = customId;
  if (id) return id;

  const segs = [];
  if (label) segs.push(label);
  const autoId = React.useId();
  segs.push(autoId);
  id = segs.join("_");
  return id;
}