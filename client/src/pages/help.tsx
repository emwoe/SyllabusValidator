import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">
          FAQ & User Guide
        </h1>
        <p className="mt-2 text-neutral-600">
          Learn how to use this site to analyze course syllabi for General
          Education requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    What file formats are supported?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      SyllabusCheck supports PDF, DOC, and DOCX file formats.
                      Files must be less than 10MB in size.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    How does the analysis work?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      This app extracts text from your uploaded syllabus and
                      analyzes it against the provided SEU General Education
                      requirements. This site was created with the help of
                      Replit and utilizes the OpenAI API.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    How accurate is the analysis?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      While our analysis is designed to be thorough, it should
                      be considered a preliminary assessment. This is an
                      experiment and we are working to improve the accuracy of
                      the app's analysis.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    What if my syllabus is identified incorrectly?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      That would be helpful for us to know! If you have feedback
                      or concerns, email Emma Woelk, Sr. Director of Academic
                      Initiatives, at ewoelk@stedwards.edu. This site is not
                      issuing approvals or denials; it is a piece of
                      experimental technology.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I save or export the analysis results?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Yes, you can export analysis results in both PDF and CSV
                      formats. All previously run analyses are available in the
                      Database section of the site.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6"></AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">
                Quick Start Guide
              </h2>

              <ol className="space-y-4 text-neutral-600">
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    1
                  </span>
                  <span>
                    Navigate to the <strong>Upload & Analyze</strong> page (home
                    page)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    2
                  </span>
                  <span>
                    Drag and drop your syllabus file or click to browse files
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    3
                  </span>
                  <span>
                    Wait for the analysis to complete (this may take a few
                    moments)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    4
                  </span>
                  <span>
                    Review the list of approved and rejected Gen Ed requirements
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    5
                  </span>
                  <span>
                    Click on each requirement to see detailed matching or
                    missing criteria
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    6
                  </span>
                  <span>
                    Navigate to the <strong>Database</strong> to view your
                    course and previously uploaded courses.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    7
                  </span>
                  <span>
                    Click on on the eye icon in a database entry to view the
                    syllabus with commentary.
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
