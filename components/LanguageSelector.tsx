"use client";

import { useTranslation } from 'react-i18next';
import { Select, SelectItem } from "@nextui-org/react";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <SelectItem key={lang.code} value={lang.code}>
          {lang.name}
        </SelectItem>
      ))}
    </Select>
  );
}