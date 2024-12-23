import React, { ReactElement } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxButton(p: {
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}): ReactElement {
  return (
    <label className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex cursor-pointer items-center space-x-2 rounded-md border px-4 py-2 font-normal">
      <Checkbox
        disabled={p.disabled}
        checked={p.checked}
        onCheckedChange={p.onCheckedChange}
      />
      <span className="ml-2 text-sm font-normal">{p.text}</span>
    </label>
  );
}
