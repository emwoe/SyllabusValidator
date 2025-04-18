import OpenAI from "openai";
import { AnalysisResult, ApprovedRequirement, RejectedRequirement } from "@shared/schema";
import { GenEdRequirement } from "./genEdAnalyzer";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Uses advanced AI to analyze syllabus text against Gen Ed requirements
 * @param syllabusText The extracted text from the syllabus
 * @param genEdRequirements Array of Gen Ed requirements to check against
 * @returns Promise<Partial<AnalysisResult>> Analysis result with approved and rejected requirements
 */
export async function analyzeWithOpenAI(
  syllabusText: string,
  genEdRequirements: GenEdRequirement[]
): Promise<Partial<AnalysisResult>> {
  try {
    // Make sure OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.");
    }
    
    // Extract course information
    console.log("Extracting course information with OpenAI...");
    const courseInfo = await extractCourseInfoWithAI(syllabusText);
    console.log(`Course identified as: ${courseInfo.name} (${courseInfo.code})`);
    
    // Process each requirement with OpenAI
    const approvedRequirements: ApprovedRequirement[] = [];
    const rejectedRequirements: RejectedRequirement[] = [];

    // Process requirements in batches to prevent token limits
    const batchSize = 3;
    const totalBatches = Math.ceil(genEdRequirements.length / batchSize);
    
    console.log(`Processing ${genEdRequirements.length} requirements in ${totalBatches} batches...`);
    
    for (let i = 0; i < genEdRequirements.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const requirementsBatch = genEdRequirements.slice(i, i + batchSize);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches}: ${requirementsBatch.map(r => r.name).join(', ')}`);
      
      try {
        const batchResults = await processRequirementsBatch(syllabusText, requirementsBatch);
        
        approvedRequirements.push(...batchResults.approved);
        rejectedRequirements.push(...batchResults.rejected);
        
        console.log(`Batch ${batchNumber} complete: ${batchResults.approved.length} approved, ${batchResults.rejected.length} rejected requirements`);
      } catch (batchError) {
        console.error(`Error processing batch ${batchNumber}:`, batchError);
        // Continue with next batch instead of failing the entire process
      }
    }

    console.log(`OpenAI analysis summary: ${approvedRequirements.length} approved, ${rejectedRequirements.length} rejected requirements`);
    
    return {
      courseName: courseInfo.name,
      courseCode: courseInfo.code,
      approvedRequirements,
      rejectedRequirements,
    };
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    throw new Error(`AI Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract course name and code from syllabus using AI
 * @param syllabusText The extracted text from the syllabus
 * @returns Promise<{name: string, code: string}> Course information
 */
async function extractCourseInfoWithAI(syllabusText: string): Promise<{ name: string; code: string }> {
  try {
    console.log("Extracting course information with AI...");
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are an expert academic document analyzer. Extract the course name and course code from the syllabus text. " +
            "Course codes typically follow formats like 'ENGL 101' or 'MATH 304'. If you cannot find the course name or code, " +
            "indicate with 'Unknown' for the name and empty string for the code. Respond in JSON format only."
        },
        {
          role: "user",
          content: `Extract the course name and course code from this syllabus:\n\n${syllabusText.substring(0, 4000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content as string);
    
    return {
      name: result.courseName || "Unknown Course",
      code: result.courseCode || "",
    };
  } catch (error) {
    console.error("Error extracting course info with AI:", error);
    return { name: "Unknown Course", code: "" };
  }
}

/**
 * Process a batch of requirements against the syllabus text
 * @param syllabusText The syllabus text to analyze
 * @param requirements Array of requirements to check
 * @returns Promise<{approved: ApprovedRequirement[], rejected: RejectedRequirement[]}> 
 */
async function processRequirementsBatch(
  syllabusText: string,
  requirements: GenEdRequirement[]
): Promise<{ approved: ApprovedRequirement[]; rejected: RejectedRequirement[] }> {
  const requirementsData = requirements.map(req => ({
    name: req.name,
    description: req.description,
    slos: req.slos,
    requiredElements: req.requiredElements,
  }));

  const truncatedSyllabus = syllabusText.substring(0, 12000); // Limit syllabus length to avoid token limits

  const prompt = `
You are an expert in academic curriculum analysis. Analyze this syllabus against the following General Education requirements.

SYLLABUS:
${truncatedSyllabus}

REQUIREMENTS TO CHECK:
${JSON.stringify(requirementsData, null, 2)}

For each requirement, determine:
1. Whether the requirement is MET or NOT MET based on the syllabus content
2. For MET requirements: Identify which specific required elements are present and which specific Student Learning Outcomes (SLOs) are addressed
3. For NOT MET requirements: Identify which specific required elements are missing and which specific SLOs are not adequately addressed

A requirement is MET if:
- At least 60% of its required elements are present in the syllabus
- At least 60% of its Student Learning Outcomes (SLOs) are addressed

Respond only in JSON format with this structure:
{
  "results": [
    {
      "requirement": "Requirement Name",
      "status": "MET" or "NOT MET",
      "matchingElements": ["Element 1", "Element 2", ...], // For MET requirements
      "matchingSLOs": [1, 2, ...], // SLO numbers (1-indexed) that are matched
      "missingElements": ["Element 3", ...], // For NOT MET requirements
      "missingSLOs": [3, 4, ...] // SLO numbers (1-indexed) that are missing
    },
    // Repeat for each requirement
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content as string);
  
  // Process the results
  const approved: ApprovedRequirement[] = [];
  const rejected: RejectedRequirement[] = [];

  for (const item of result.results) {
    if (item.status === "MET") {
      approved.push({
        name: item.requirement,
        matchingRequirements: item.matchingElements || [],
        matchingSLOs: item.matchingSLOs || [],
      });
    } else {
      rejected.push({
        name: item.requirement,
        missingRequirements: item.missingElements || [],
        missingSLOs: item.missingSLOs || [],
      });
    }
  }

  return { approved, rejected };
}