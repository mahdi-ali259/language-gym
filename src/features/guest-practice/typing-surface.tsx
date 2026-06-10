"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/class-names";
import { focusRing, transitions } from "@/styles/design-tokens";

type TypingSurfaceProps = {
  currentMeaning?: string;
  onChange: (value: string) => void;
  target: string;
  value: string;
};

export function TypingSurface({
  currentMeaning,
  onChange,
  target,
  value
}: TypingSurfaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetCharacters = Array.from(target);
  const typedCharacters = Array.from(value);

  useEffect(() => {
    inputRef.current?.focus();
  }, [target]);

  function focusInput() {
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  return (
    <div
      className={cn(
        "relative cursor-text rounded-[1.75rem] px-1 py-6 sm:px-4 sm:py-8",
        focusRing,
        transitions
      )}
      onClick={focusInput}
      role="group"
      tabIndex={-1}
    >
      <input
        ref={inputRef}
        aria-label="Type the displayed English sentence"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        className="sr-only"
        inputMode="text"
        onChange={(event) =>
          onChange(event.target.value.slice(0, target.length))
        }
        onKeyDown={handleKeyDown}
        spellCheck={false}
        value={value}
      />

      {currentMeaning ? (
        <p className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-sm font-medium text-blue-700">
          {currentMeaning}
        </p>
      ) : null}
      <div
        aria-hidden="true"
        className="flex flex-wrap justify-center gap-x-0.5 gap-y-2 text-center text-4xl font-semibold leading-[1.4] text-slate-300 sm:text-5xl"
      >
        {targetCharacters.map((character, index) => {
          const typedCharacter = typedCharacters[index];
          const isCurrent = index === typedCharacters.length;
          const isTyped = typedCharacter !== undefined;
          const isCorrect = typedCharacter === character;

          return (
            <span
              className={cn(
                "relative rounded-md px-0.5",
                isTyped && isCorrect && "text-slate-950",
                isTyped &&
                  !isCorrect &&
                  "bg-rose-50 text-rose-500 ring-1 ring-rose-100",
                isCurrent &&
                  "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-blue-500"
              )}
              key={`${character}-${index}`}
            >
              {character === " " ? "\u00A0" : character}
            </span>
          );
        })}
      </div>
    </div>
  );
}
