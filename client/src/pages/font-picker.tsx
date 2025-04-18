import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import FontOption from '@/components/FontOption';

const fontOptions = [
  { fontFamily: 'Roboto Slab, serif', name: 'Roboto Slab (Current)' },
  { fontFamily: 'Playfair Display, serif', name: 'Playfair Display' },
  { fontFamily: 'Montserrat, sans-serif', name: 'Montserrat' },
  { fontFamily: 'Lora, serif', name: 'Lora' },
  { fontFamily: 'Merriweather, serif', name: 'Merriweather' },
  { fontFamily: 'Poppins, sans-serif', name: 'Poppins' }
];

export default function FontPicker() {
  const [selectedFont, setSelectedFont] = useState<string>('Roboto Slab, serif');
  const [applied, setApplied] = useState<boolean>(false);

  const handleFontSelect = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    setApplied(false);
  };

  const applyFont = () => {
    // In a real app, this would update the global theme or settings
    // For now, we'll just show a success message
    localStorage.setItem('preferredHeaderFont', selectedFont);
    setApplied(true);
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Font Options</h1>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Choose a Header Font</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 mb-6">
            Select a font for the application header. This font will be used for the main title and headings throughout the application.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {fontOptions.map((font) => (
              <FontOption
                key={font.name}
                fontFamily={font.fontFamily}
                fontName={font.name}
                onSelect={handleFontSelect}
                isSelected={selectedFont === font.fontFamily}
              />
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div>
              {applied && (
                <span className="text-green-600 flex items-center">
                  <Check size={16} className="mr-1" /> Font applied successfully
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button onClick={applyFont} disabled={applied}>
                Apply Font
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md">
            <div className="bg-white shadow-sm mb-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Preview title */}
                <div className="text-left py-4 border-b border-neutral-100">
                  <span 
                    className="text-primary text-2xl font-bold"
                    style={{ fontFamily: selectedFont }}
                  >
                    SEU Gen Ed Syllabus Checker
                  </span>
                </div>

                {/* Navigation below title */}
                <div className="flex justify-between h-14">
                  <div className="flex">
                    <nav className="flex space-x-8">
                      <span className="inline-flex items-center px-3 pt-1 border-b-2 border-primary text-sm font-medium text-neutral-900">
                        Upload & Analyze
                      </span>
                      <span className="inline-flex items-center px-3 pt-1 border-b-2 border-transparent text-sm font-medium text-neutral-600">
                        Database
                      </span>
                      <span className="inline-flex items-center px-3 pt-1 border-b-2 border-transparent text-sm font-medium text-neutral-600">
                        Help
                      </span>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            <h2 
              className="text-xl font-bold mb-3"
              style={{ fontFamily: selectedFont }}
            >
              Example Content
            </h2>
            <p className="text-neutral-600 mb-4">
              This is how the application would look with the selected font applied to headings.
              The body text remains in the default font for better readability.
            </p>

            <div className="bg-neutral-50 p-3 rounded">
              <h3 
                className="text-lg font-medium mb-2" 
                style={{ fontFamily: selectedFont }}
              >
                Sample Analysis Results
              </h3>
              <p className="text-sm text-neutral-600">
                Analysis results would appear here, with headings using the selected font
                and body text using the default font.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}