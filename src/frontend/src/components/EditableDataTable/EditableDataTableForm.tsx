"use client";

import React from "react";
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFieldArrayRemove,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { dateToFormatForUser } from "@/components/common/constants";

interface EditableDataTableFormProps {
  control: Control<any>;
  fields: FieldArrayWithId[];
  availableEmployees: string[];
  remainingAvailableEmployees: string[];
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
}

export function EditableDataTableForm(p: EditableDataTableFormProps) {
  return (
    <div className="col-span-2 w-full">
      <form onSubmit={p.onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Employee Shift Schedule</CardTitle>
            <CardDescription>Manage employee shifts and breaks</CardDescription>
          </CardHeader>
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
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {p.date ? (
                      dateToFormatForUser(p.date)
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={p.date}
                    onSelect={(date: Date | undefined) =>
                      p.setDate(date || p.date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                className="font-normal"
                variant="outline"
                onClick={p.useBlankTemplate}
                type="button"
              >
                Blank
              </Button>
              <Button
                className="font-normal"
                variant="outline"
                onClick={p.useGamesTemplate}
                type="button"
              >
                Games
              </Button>
              <Button
                className="font-normal"
                variant="outline"
                onClick={p.useWWTemplate}
                type="button"
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
                        name={`rows.${index}.employeeName`}
                        control={p.control}
                        render={({ field }) => (
                          <Combobox
                            value={field.value}
                            values={p.availableEmployees}
                            remainingValues={p.remainingAvailableEmployees}
                            onChange={field.onChange}
                            name="employee"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`rows.${index}.shiftTitle`}
                        control={p.control}
                        render={({ field }) => (
                          <Combobox
                            value={field.value}
                            values={p.shiftTitles}
                            remainingValues={p.shiftTitles}
                            onChange={field.onChange}
                            name="shift"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`rows.${index}.start`}
                        control={p.control}
                        render={({ field }) => (
                          <Combobox
                            value={field.value}
                            values={p.shiftTimes}
                            remainingValues={p.shiftTimes}
                            onChange={field.onChange}
                            name="start time"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`rows.${index}.end`}
                        control={p.control}
                        render={({ field }) => (
                          <Combobox
                            value={field.value}
                            values={p.shiftTimes}
                            remainingValues={p.shiftTimes}
                            onChange={field.onChange}
                            name="end time"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`rows.${index}.breakDuration`}
                        control={p.control}
                        render={({ field }) => (
                          <Combobox
                            value={field.value}
                            values={p.breakDurations}
                            remainingValues={p.breakDurations}
                            onChange={field.onChange}
                            name="break duration"
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" onClick={p.addRow}>
              Add Row
            </Button>
            <Button
              type="submit"
              disabled={p.isSubmitting}
              onClick={p.onSubmit}
            >
              {p.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
