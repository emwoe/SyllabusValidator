import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Help & Documentation</h1>
        <p className="mt-2 text-neutral-600">Learn how to use SyllabusCheck to analyze course syllabi for General Education requirements.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">What file formats are supported?</AccordionTrigger>
                  <AccordionContent>
                    <p>SyllabusCheck supports PDF, DOC, and DOCX file formats. Files must be less than 10MB in size.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">How does the analysis work?</AccordionTrigger>
                  <AccordionContent>
                    <p>Our system extracts text from your uploaded syllabus and analyzes it against the established General Education requirements. The analysis looks for specific keywords, phrases, and patterns that indicate whether the course meets each requirement. The system checks for both required elements and Student Learning Outcomes (SLOs).</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">How accurate is the analysis?</AccordionTrigger>
                  <AccordionContent>
                    <p>While our analysis is designed to be thorough, it should be considered a preliminary assessment. The final determination of whether a course meets General Education requirements should always be made by the appropriate academic committee or department. The tool aims to help identify which requirements a syllabus is most likely to meet based on its content.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">What if my syllabus is identified incorrectly?</AccordionTrigger>
                  <AccordionContent>
                    <p>If you believe the analysis results are incorrect, review the detailed breakdown to see which specific requirements or SLOs were identified or missed. Make sure your syllabus explicitly addresses the required elements and learning outcomes for the Gen Ed category. You may need to revise your syllabus to more clearly align with the requirements.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">Can I save or export the analysis results?</AccordionTrigger>
                  <AccordionContent>
                    <p>Yes, you can export analysis results in both PDF and CSV formats. You can also save the results to the database for future reference. All saved analyses are available in the Database section of the site.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">How can I improve my syllabus to meet Gen Ed requirements?</AccordionTrigger>
                  <AccordionContent>
                    <p>To improve your syllabus, focus on explicitly addressing the Student Learning Outcomes (SLOs) and required elements for each Gen Ed category. Make sure to use clear language that aligns with the requirements. Include specific assignments, activities, or assessments that demonstrate how students will achieve each SLO.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Start Guide</h2>
              
              <ol className="space-y-4 text-neutral-600">
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">1</span>
                  <span>Navigate to the <strong>Upload & Analyze</strong> page (home page)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">2</span>
                  <span>Drag and drop your syllabus file or click to browse files</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">3</span>
                  <span>Wait for the analysis to complete (this may take a few moments)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">4</span>
                  <span>Review the list of approved and rejected Gen Ed requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">5</span>
                  <span>Click on each requirement to see detailed matching or missing criteria</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 mr-2">6</span>
                  <span>Save to database or export results as needed</span>
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Contact Support</h2>
              
              <p className="text-neutral-600 mb-4">
                If you need additional help or have questions not covered in our documentation, please reach out to our support team.
              </p>
              
              <div className="space-y-2 text-neutral-600">
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">email</span>
                  <span>support@syllabuscheck.edu</span>
                </div>
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">phone</span>
                  <span>(555) 123-4567</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
