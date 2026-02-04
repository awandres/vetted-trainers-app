"use client";

import { Palette, Check } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@vt/ui";
import { useTheme, ThemeVariant } from "./ThemeProvider";

const themes: { value: ThemeVariant; label: string; description: string; preview: string }[] = [
  {
    value: "default",
    label: "Classic Green",
    description: "Light theme with green accents",
    preview: "bg-green-500",
  },
  {
    value: "vt-blue",
    label: "VT Blue",
    description: "Light theme with VT cyan blue",
    preview: "bg-[#50BFF4]",
  },
  {
    value: "vt-graphite",
    label: "VT Graphite",
    description: "Dark graphite with VT cyan blue",
    preview: "bg-gradient-to-r from-[#1e2329] to-[#50BFF4]",
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={`h-6 w-6 rounded-full ${t.preview} shrink-0`} />
            <div className="flex-1">
              <p className="font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            {theme === t.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
