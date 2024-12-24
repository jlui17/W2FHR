import React, { ReactElement } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function Combobox(p: {
  value: string;
  values: string[];
  onChange: (...event: any[]) => void;
  name: string;
}): ReactElement {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[200px] justify-between",
            !p.value && "text-muted-foreground",
          )}
        >
          {p.value
            ? p.values.find((item) => item === p.value)
            : `Select a ${p.name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search for a ${p.name}...`} />
          <CommandList>
            <CommandEmpty>{`No ${p.name}s found.`}</CommandEmpty>
            <CommandGroup>
              {p.values.map((item) => (
                <CommandItem key={item} value={item} onSelect={p.onChange}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      item === p.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
