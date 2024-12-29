import React, { ReactElement } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const DEFAULT_WIDTH: string = "w-[125px]";
const SELECTED_OPACITY: string = "opacity-65";

export function Combobox(p: {
  value: string;
  values: string[];
  selectedValues?: Set<string>;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}): ReactElement {
  const className: boolean = p.className !== undefined && p.className.includes("w-");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "justify-between",
            !p.value && "text-muted-foreground",
            !className && DEFAULT_WIDTH,
            p.className,
          )}
        >
          {p.value ? p.values.find((item) => item === p.value) : `Select a ${p.name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", !className && DEFAULT_WIDTH, p.className)}>
        <Command>
          <CommandInput placeholder={`Search for a ${p.name}...`} />
          <CommandList>
            <CommandEmpty>{`No ${p.name}s found.`}</CommandEmpty>
            <CommandGroup>
              {p.values.map((item: string): ReactElement => {
                const isSelected: boolean =
                  p.selectedValues !== undefined ? p.selectedValues.has(item) : item === p.value;
                return (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={p.onChange}
                    className={isSelected ? SELECTED_OPACITY : ""}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? SELECTED_OPACITY : "opacity-0")} />
                    {item}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
