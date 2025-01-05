"use client";

import React from "react";
import { Control, Controller, FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { dateToFormatForUser } from "@/components/common/constants";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EditableDataTableFormProps {
  control: Control<any>;
  fields: FieldArrayWithId[];
  availableEmployees: string[];
  selectedEmployees: Set<string>;
  shiftTitles: string[];
  shiftTimes: string[];
  breakDurations: string[];
  onSubmit: () => void;
  addRow: () => void;
  removeRow: UseFieldArrayRemove;
  isSubmitting: boolean;
  date: Date;
  setDate: (date: Date) => void;
  useBlankTemplate: () => void;
  useGamesTemplate: () => void;
  useWWTemplate: () => void;
  open: boolean;
  onOpenChange: () => void;
}

function onSelectEmployee(
  currentValue: string,
  newValue: string,
  selectedEmployees: Set<string>,
  onChange: (value: string) => void,
): void {
  if (currentValue === newValue) {
    onChange(newValue);
    return;
  }

  const isEmployeeSelected = selectedEmployees.has(newValue);

  if (isEmployeeSelected) {
    toast.warning("Employee Already Selected", {
      description: "This employee has already been assigned to another shift.",
      duration: 3000,
    });
    return;
  }

  onChange(newValue);
}

export function NewScheduleForm(p: EditableDataTableFormProps) {
  return (
    <div className="col-span-2 w-full">
      <form onSubmit={p.onSubmit}>
        <Collapsible open={p.open} onOpenChange={p.onOpenChange}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between transition-colors duration-200 hover:bg-gray-100">
                <CardTitle className="m-auto">New Schedule</CardTitle>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {p.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle table</span>
                </Button>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex items-center gap-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "mr-6 w-[240px] justify-start text-left font-normal",
                          !p.date && "text-muted-foreground",
                        )}
                        disabled={p.isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {p.date ? dateToFormatForUser(p.date) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={p.date}
                        onSelect={(date: Date | undefined) => p.setDate(date || p.date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    className="font-normal"
                    variant="outline"
                    onClick={p.useBlankTemplate}
                    type="button"
                    disabled={p.isSubmitting}
                  >
                    Blank
                  </Button>
                  <Button
                    className="font-normal"
                    variant="outline"
                    onClick={p.useGamesTemplate}
                    type="button"
                    disabled={p.isSubmitting}
                  >
                    Games
                  </Button>
                  <Button
                    className="font-normal"
                    variant="outline"
                    onClick={p.useWWTemplate}
                    type="button"
                    disabled={p.isSubmitting}
                  >
                    WW
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Break</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {p.fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => p.removeRow(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`shifts.${index}.employee`}
                            control={p.control}
                            render={({ field }) => (
                              <Combobox
                                value={field.value}
                                values={p.availableEmployees}
                                selectedValues={p.selectedEmployees}
                                onChange={(newValue: string): void =>
                                  onSelectEmployee(field.value, newValue, p.selectedEmployees, field.onChange)
                                }
                                name="employee"
                                className="w-[300px]"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`shifts.${index}.shiftTitle`}
                            control={p.control}
                            render={({ field }) => (
                              <Combobox
                                value={field.value}
                                values={p.shiftTitles}
                                onChange={field.onChange}
                                name="shift"
                                className="w-[250px]"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`shifts.${index}.startTime`}
                            control={p.control}
                            render={({ field }) => (
                              <Combobox
                                value={field.value}
                                values={p.shiftTimes}
                                onChange={field.onChange}
                                name="start time"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`shifts.${index}.endTime`}
                            control={p.control}
                            render={({ field }) => (
                              <Combobox
                                value={field.value}
                                values={p.shiftTimes}
                                onChange={field.onChange}
                                name="end time"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`shifts.${index}.breakDuration`}
                            control={p.control}
                            render={({ field }) => (
                              <Combobox
                                value={field.value}
                                values={p.breakDurations}
                                onChange={field.onChange}
                                name="break duration"
                                className="w-[200px]"
                              />
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex w-full justify-between">
                <Button type="button" onClick={p.addRow}>
                  Add Row
                </Button>
                <Button type="submit" disabled={p.isSubmitting} onClick={p.onSubmit}>
                  {p.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </CardFooter>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </form>
    </div>
  );
}
