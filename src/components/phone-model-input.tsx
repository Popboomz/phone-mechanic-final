
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import type { PhoneModelInputProps } from "@/lib/types";

const brands = ["IPHONE", "SAMSUNG", "PIXEL", "HUAWEI", "OPPO", "VIVO", "NOKIA"];

export const PhoneModelInput = React.forwardRef<HTMLInputElement, PhoneModelInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleBrandSelect = (brand: string) => {
      const newValue = `${brand} `;
      if (onChange) {
        // Create a synthetic event for react-hook-form
        const event = {
          target: { value: newValue, name: props.name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      
      // Focus and position cursor at the end of the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newValue.length, newValue.length);
        }
      }, 0);
    };

    return (
      <div className="flex w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-r-none border-r-0"
            >
              Brand
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {brands.map((brand) => (
              <DropdownMenuItem
                key={brand}
                onSelect={() => handleBrandSelect(brand)}
              >
                {brand}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          {...props}
          value={value}
          onChange={onChange}
          ref={inputRef} // Use the local ref here
          className="rounded-l-none"
          placeholder="e.g., 15 Pro or manually enter full model"
        />
      </div>
    );
  }
);

PhoneModelInput.displayName = "PhoneModelInput";
