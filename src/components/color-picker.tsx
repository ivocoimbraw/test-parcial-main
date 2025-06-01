"use client";

import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  id?: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
];

export function ColorPicker({ id, color, onChange, className }: ColorPickerProps) {
  const [value, setValue] = useState(color || "#000000");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(color || "#000000");
  }, [color]);

  const handleChange = (newColor: string) => {
    setValue(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className={cn("w-full justify-start text-left font-normal", className)}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border" style={{ backgroundColor: value }} />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-md border" style={{ backgroundColor: value }} />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "h-6 w-6 rounded-md border",
                  value === presetColor && "ring-2 ring-offset-2 ring-blue-400"
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => handleChange(presetColor)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              id={`${id}-input`}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1"
            />
            <input
              type="color"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              id={`${id}-color`}
              className="h-9 w-9 cursor-pointer appearance-none overflow-hidden rounded-md border"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
