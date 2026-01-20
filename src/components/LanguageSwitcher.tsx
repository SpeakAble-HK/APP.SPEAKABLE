import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSwitcherProps {
  value: string;
  onChange: (value: string) => void;
}

const languages = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
];

export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] bg-card border-border">
        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
