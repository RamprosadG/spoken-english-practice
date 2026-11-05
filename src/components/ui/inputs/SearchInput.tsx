"use client";

import React, { useEffect, useState, useRef } from "react";
import Input from "@/components/ui/inputs/Input";
import { IoSearchSharp } from "react-icons/io5";

interface SearchInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onDebouncedChange,
  delay = 350,
  placeholder = "Search...",
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const callbackRef = useRef(onDebouncedChange);
  // The value the parent already holds. Comparing against it — rather than a
  // "first render" flag — keeps StrictMode's double-invoked mount effect
  // silent: the flag is spent by the discarded pass, so the timer would fire on
  // mount and push an unchanged query back into the URL.
  const emittedValue = useRef(value);

  useEffect(() => {
    callbackRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    if (internalValue === emittedValue.current) return;

    const handler = setTimeout(() => {
      emittedValue.current = internalValue;
      callbackRef.current(internalValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [internalValue, delay]);

  useEffect(() => {
    if (value !== internalValue) {
      // Server-rendered pages push the query into the URL, so an external value
      // change must re-seed the local input text. The parent raised that value
      // itself, so record it as emitted instead of sending it back.
      emittedValue.current = value;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalValue(value);
    }
  }, [value]);

  return (
    <div className={`relative w-full ${className}`}>
      <Input
        type="text"
        icon={<IoSearchSharp className="w-4 h-4" />}
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
