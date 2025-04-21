import OpenAI from "openai";
import { AnalysisResult, ApprovedRequirement, RejectedRequirement, RequirementFit } from "@shared/schema";
import { GenEdRequirement } from "./genEdAnalyzer";
import { config } from "../config";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = config.openai.model;

/**
 * Extract Student Learning Outcomes (SLOs) from the syllabus text
 * @param syllabusText The full text of the syllabus
 * @returns Promise<string> The extracted SLOs text or a message indicating none were found
 */
async function extractSyllabusLearningOutcomes(syllabusText: string): Promise<string> {
  try {
    console.log("Extracting Student Learning Outcomes from syllabus...");
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are an expert academic syllabus analyzer. Your task is to extract the Student Learning Outcomes (SLOs) " +
            "from the syllabus. These are typically found in sections labeled 'Learning Outcomes', 'Student Learning Outcomes', " +
            "'Course Objectives', 'Learning Objectives', 'Learning Goals', 'Course Learning Outcomes', or similar. " +
            "Look for numbered or bulleted lists of skills or knowledge students should gain from the course. " +
            "SLOs often start with action verbs like 'analyze', 'evaluate', 'understand', 'demonstrate', 'identify', etc. " +
            "Focus on statements that describe what students will be able to do or know by the end of the course. " +
            "ONLY extract the actual SLOs, not surrounding explanatory text. If no explicit SLOs are found, extract statements " +
            "that most clearly describe the intended learning outcomes from the course."
        },
        {
          role: "user",
          content: `Extract all Student Learning Outcomes from this syllabus. Format each SLO as a numbered list item, starting with an action verb when possible. Focus on statements that describe what students will learn or be able to do:\n\n${syllabusText.substring(0, 15000)}`,
        },
      ],
    });

    const extractedSLOs = response.choices[0].message.content;
    
    if (!extractedSLOs || extractedSLOs.trim().length < 10) {
      console.log("No clear SLOs found in syllabus");
      return "No clear Student Learning Outcomes could be identified in the syllabus.";
    }
    
    console.log("Successfully extracted Student Learning Outcomes:");
    console.log("==== EXTRACTED SLOs ====");
    console.log(extractedSLOs);
    console.log("==== END EXTRACTED SLOs ====");
    return extractedSLOs;
  } catch (error) {
    console.error("Error extracting SLOs:", error);
    return "Error extracting Student Learning Outcomes from syllabus.";
  }
}

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
    if (!config.openai.apiKey) {
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
    
    // Determine requirement fit categories
    console.log("Analyzing Student Learning Outcomes to determine best fits...");
    const fitResults = await determineRequirementFits(syllabusText, approvedRequirements, rejectedRequirements, genEdRequirements);
    
    if (fitResults.bestFit) {
      console.log(`Best fit identified: ${fitResults.bestFit.name} with match score ${fitResults.bestFit.matchScore}%`);
    } else {
      console.log("No clear best fit identified");
    }
    
    return {
      courseName: courseInfo.name,
      courseCode: courseInfo.code,
      approvedRequirements,
      rejectedRequirements,
      bestFit: fitResults.bestFit,
      potentialFits: fitResults.potentialFits,
      poorFits: fitResults.poorFits,
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

SPECIAL CRITERIA FOR SPECIFIC REQUIREMENTS:

1. ETHICS REQUIREMENT:
- Courses should ONLY be approved for Ethics/Ethical Reasoning if they are primarily philosophy courses taught in a philosophy department.
- Look for explicit mentions that the course is housed in a philosophy department or has a PHIL course code.
- The syllabus must clearly indicate that the course focuses on philosophical ethics, not just ethical considerations within another discipline.
- If the syllabus doesn't explicitly state that it's a philosophy course in a philosophy department, mark "Ethics" as NOT MET regardless of other criteria.

2. MODERN LANGUAGE REQUIREMENT:
- Courses should ONLY be approved for Modern Language if they explicitly state that students will learn to communicate in a non-English language.
- The syllabus must clearly indicate that active language learning (speaking, writing, reading) in a non-English language is a primary focus of the course.
- Look for evidence of assignments, exercises, or assessments conducted in the non-English language.
- If the syllabus doesn't explicitly show that students will actively learn to communicate in a non-English language, mark "Modern Language" as NOT MET regardless of other criteria.

3. CREATIVITY AND MAKING REQUIREMENT:
- For the "Creativity and Making" requirement, it can ONLY be approved if more than half (>50%) of the course content is dedicated to creative writing, theater, design, or visual arts. 
- Look for evidence in the course schedule, assignments, and learning activities that the majority of the class time and coursework focuses on these creative disciplines.
- If the syllabus doesn't clearly demonstrate that more than half of the class is dedicated to these creative activities, mark "Creativity and Making" as NOT MET regardless of other criteria.

Be strict in applying these special criteria. Do not mark a requirement as MET unless it fully satisfies its specific criteria.

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
      // Add specific reason explanations for certain requirements when they're not met
      let extendedMissingRequirements = [...(item.missingElements || [])];
      
      // Add special detailed explanations for the strict requirement failures
      if (item.requirement === "Ethics" || item.requirement === "Ethical Reasoning") {
        if (!extendedMissingRequirements.some(r => r.includes("philosophy department"))) {
          extendedMissingRequirements.push(
            "Course must be primarily a philosophy course taught in a philosophy department"
          );
        }
      }
      
      if (item.requirement === "Modern Language") {
        if (!extendedMissingRequirements.some(r => r.includes("non-English language"))) {
          extendedMissingRequirements.push(
            "Course must explicitly focus on teaching students to communicate in a non-English language"
          );
        }
      }
      
      if (item.requirement === "Creativity and Making") {
        if (!extendedMissingRequirements.some(r => r.includes("more than half"))) {
          extendedMissingRequirements.push(
            "More than 50% of the course must be dedicated to creative writing, theater, design, or visual arts"
          );
        }
      }
      
      rejected.push({
        name: item.requirement,
        missingRequirements: extendedMissingRequirements,
        missingSLOs: item.missingSLOs || [],
      });
    }
  }

  return { approved, rejected };
}

/**
 * Determine which requirements best fit the syllabus
 * @param syllabusText The syllabus text to analyze
 * @param approvedRequirements List of requirements that the syllabus meets
 * @param rejectedRequirements List of requirements that the syllabus does not meet
 * @param genEdRequirements Full list of Gen Ed requirements
 * @returns Promise<{bestFit?: RequirementFit, potentialFits: RequirementFit[], poorFits: RequirementFit[]}>
 */
async function determineRequirementFits(
  syllabusText: string,
  approvedRequirements: ApprovedRequirement[],
  rejectedRequirements: RejectedRequirement[],
  genEdRequirements: GenEdRequirement[]
): Promise<{
  bestFit?: RequirementFit, 
  potentialFits: RequirementFit[], 
  poorFits: RequirementFit[]
}> {
  try {
    // First extract the SLOs from the syllabus
    console.log("Extracting Student Learning Outcomes for fit analysis...");
    const extractedSLOs = await extractSyllabusLearningOutcomes(syllabusText);
    
    // Truncate syllabus to avoid token limits
    const truncatedSyllabus = syllabusText.substring(0, 10000);
    
    // Prepare requirements data
    const requirementsData = genEdRequirements.map(req => ({
      name: req.name,
      description: req.description,
      slos: req.slos,
    }));
    
    // Prepare approved and rejected requirements summaries
    const approvedNames = approvedRequirements.map(r => r.name);
    const rejectedNames = rejectedRequirements.map(r => r.name);
    
    // Create a prompt for OpenAI to analyze requirement fits
    const prompt = `
You are an expert in analyzing academic syllabi against General Education requirements.

SYLLABUS TEXT (excerpt):
${truncatedSyllabus}

EXTRACTED STUDENT LEARNING OUTCOMES FROM SYLLABUS:
${extractedSLOs}

REQUIREMENTS:
${JSON.stringify(requirementsData, null, 2)}

CURRENT ANALYSIS:
The syllabus has PASSED these requirements: ${approvedNames.join(', ') || "None"}
The syllabus has FAILED these requirements: ${rejectedNames.join(', ') || "None"}

Your task is to categorize ALL requirements by how well they fit this syllabus:
1. BEST FIT (select at most 2): The requirements that are the most natural and appropriate for this course based on how well they align with the extracted Student Learning Outcomes
2. POTENTIAL FITS: Requirements that have moderate alignment with the extracted Student Learning Outcomes
3. POOR FITS: Requirements that have minimal or no alignment with the extracted Student Learning Outcomes

For each requirement, provide:
- A match score (0-100) indicating how well it aligns with the extracted Student Learning Outcomes
- Which SLOs (Student Learning Outcomes) from the requirement are matched with the syllabus SLOs
- Which SLOs from the requirement are missing in the syllabus SLOs
- A brief reasoning explaining why the requirement falls into its category

A FEW IMPORTANT RULES:
- Focus specifically on matching the EXTRACTED STUDENT LEARNING OUTCOMES from the syllabus with the SLOs listed for each requirement
- A requirement with higher SLO matches should receive a higher match score
- Your primary focus should be on the content of the learning outcomes, not just technical compliance or keyword matches
- Your recommendation should help faculty understand where their course best fits in the Gen Ed curriculum
- Select at most 2 requirements as best fits to ensure clarity for faculty members

Respond in JSON with this structure:
{
  "bestFits": [
    {
      "name": "Requirement Name",
      "matchScore": 85,
      "matchingSLOs": [1, 2],
      "missingSLOs": [3],
      "reasoning": "Brief explanation of why this is the best fit based on SLO alignment..."
    }
  ],
  "potentialFits": [
    {
      "name": "Requirement Name",
      "matchScore": 60,
      "matchingSLOs": [1],
      "missingSLOs": [2, 3],
      "reasoning": "Brief explanation of why this is a potential fit based on SLO alignment..."
    }
  ],
  "poorFits": [
    {
      "name": "Requirement Name",
      "matchScore": 15,
      "matchingSLOs": [],
      "missingSLOs": [1, 2, 3],
      "reasoning": "Brief explanation of why this is a poor fit based on SLO alignment..."
    }
  ]
}
`;

    // Make the AI request
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

    // Parse the result
    const result = JSON.parse(response.choices[0].message.content as string);
    
    // Process the result to handle the new structure with multiple best fits
    const bestFits = result.bestFits || [];
    
    if (bestFits.length > 0) {
      console.log(`Found ${bestFits.length} best fits:`);
      bestFits.forEach((fit, index) => {
        console.log(`${index + 1}. ${fit.name} (Score: ${fit.matchScore}%, Matching SLOs: ${fit.matchingSLOs.length}, Missing SLOs: ${fit.missingSLOs.length})`);
        console.log(`   Reasoning: ${fit.reasoning}`);
      });
    } else {
      console.log("No best fits found in the analysis");
    }
    
    return {
      // Take the first best fit as the primary one if available
      bestFit: bestFits.length > 0 ? bestFits[0] : undefined,
      // If there's a second best fit, add it to potential fits
      potentialFits: [
        ...(bestFits.length > 1 ? [bestFits[1]] : []),
        ...(result.potentialFits || [])
      ],
      poorFits: result.poorFits || [],
    };
  } catch (error) {
    console.error("Error determining requirement fits:", error);
    // Return empty fit categorizations if there's an error rather than failing entirely
    return { potentialFits: [], poorFits: [] };
  }
}