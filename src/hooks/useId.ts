import React from "react";

type UseIdResult = string;

export const useId = (customId?: string, label?: string): UseIdResult => {
  const segs = [];
  if (label) segs.push(label);
  const autoId = React.useId();
  segs.push(autoId);
  let id = segs.join("_");
  
  if (customId) id = customId;
  return id;
}