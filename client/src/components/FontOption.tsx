import React from 'react';

interface FontOptionProps {
  fontFamily: string;
  fontName: string;
  onSelect: (fontFamily: string) => void;
  isSelected: boolean;
}

export default function FontOption({ fontFamily, fontName, onSelect, isSelected }: FontOptionProps) {
  return (
    <div 
      className={`p-4 border rounded-md cursor-pointer transition-all 
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-neutral-200 hover:border-primary/30 hover:bg-neutral-50'
        }`}
      onClick={() => onSelect(fontFamily)}
    >
      <h3 
        className={`text-2xl mb-2 font-bold text-primary`} 
        style={{ fontFamily }}
      >
        SEU Gen Ed Syllabus Checker
      </h3>
      <p className="text-sm text-neutral-600">{fontName}</p>
    </div>
  );
}