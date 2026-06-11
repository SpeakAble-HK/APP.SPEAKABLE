import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface LanguageSwitcherProps {
  value: string;
  onChange: (value: string) => void;
}

const languages = [
  { value: 'zh-TW', label: '廣東話（繁體中文）' },
];

export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] bg-card border-border">
        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="選擇語言" />
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
