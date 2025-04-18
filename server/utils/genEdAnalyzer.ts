import { AnalysisResult, ApprovedRequirement, RejectedRequirement } from "@shared/schema";
import fs from "fs";
import path from "path";

// Define the Gen Ed requirements structure based on the PDF
interface GenEdRequirement {
  name: string;
  description: string;
  slos: string[];
  keywords: string[];
  requiredElements: string[];
}

// Load the Gen Ed requirements data
const genEdRequirements: GenEdRequirement[] = [
  {
    name: "Freshmen Seminar",
    description: "Students will join a community of learners and actively engage in academic and co-curricular exploration.",
    slos: [
      "Identify assumptions rooted in a variety of perspectives.",
      "Interpret and evaluate issues, evidence, and sources.",
      "Communicate effectively about multiple perspectives.",
      "Reflect on and apply knowledge developed in the classroom and co-curricular experiences."
    ],
    keywords: ["community", "learners", "academic", "co-curricular", "exploration", "critical thinking", "social justice"],
    requiredElements: [
      "Community of learners",
      "Academic exploration",
      "Co-curricular activities",
      "Social justice components",
      "Critical thinking development"
    ]
  },
  {
    name: "Quantitative Reasoning",
    description: "Students must use mathematical, statistical, and/or computational methods to analyze and solve problems involving quantitative information.",
    slos: [
      "Interpret quantitative information.",
      "Use quantitative methods to solve problems.",
      "Develop conclusions based on quantitative analysis."
    ],
    keywords: ["mathematical", "statistical", "computational", "quantitative", "analysis", "problem-solving", "data"],
    requiredElements: [
      "Mathematical or statistical methods",
      "Quantitative problem-solving",
      "Data analysis components",
      "Drawing conclusions from analysis"
    ]
  },
  {
    name: "Modern Language",
    description: "Students learn to interpret information in authentic messages and informational texts using listening, reading, and viewing strategies.",
    slos: [
      "Interpret information in authentic messages and informational texts using listening, reading, and viewing strategies.",
      "Interact with others using culturally appropriate language and gestures.",
      "Present meaningful information, concepts and viewpoints.",
      "Compare social practices from their own culture relative to those from another culture."
    ],
    keywords: ["language", "authentic messages", "culturally appropriate", "social practices", "foreign language", "communication"],
    requiredElements: [
      "Language instruction",
      "Cultural components",
      "Communication practice",
      "Authentic language materials"
    ]
  },
  {
    name: "Oral Communication",
    description: "Students develop professional speech structure and delivery techniques for effective presentations.",
    slos: [
      "Employ a professional speech structure that reinforces the central message of the presentation.",
      "Communicate a central message effectively through insightful word choice and creative selection of appropriate rhetorical devices.",
      "Deploy a variety of appropriate delivery tools to engage the audience.",
      "Offer varied and relevant evidence to support their credibility."
    ],
    keywords: ["speech", "presentation", "delivery", "audience", "rhetorical", "credibility", "oral"],
    requiredElements: [
      "At least 3 major presentations",
      "Speech structure instruction",
      "Delivery techniques practice",
      "Audience engagement strategies"
    ]
  },
  {
    name: "Writing 1",
    description: "Students learn to read, understand, and use a variety of text to support various writing goals.",
    slos: [
      "Read, understand, and use a variety of text to support various writing goals.",
      "Identify and demonstrate an awareness of the writing process through successive drafts and revisions.",
      "Analyze and respond to various writing situations and demonstrate appropriate rhetorical and writing choices.",
      "Demonstrate an understanding of audience and genre conventions within their writing.",
      "Analyze and respond to substantive issues in their writing that show global improvement through substantial and successive revision."
    ],
    keywords: ["writing process", "drafts", "revision", "rhetorical", "audience", "genre conventions", "text analysis"],
    requiredElements: [
      "Reading strategies for difficult texts",
      "Multiple drafting and revision",
      "Rhetorical analysis components",
      "Audience awareness development",
      "Substantive revision processes"
    ]
  },
  {
    name: "Writing 2",
    description: "Students analyze and understand how and why different discourse communities produce research using various conventions.",
    slos: [
      "Analyze and understand how and why different discourse communities produce research using various conventions.",
      "Find and use appropriate resources to support inquiry-based research.",
      "Adapt research practices and compose successive and appropriate writing tasks to varied rhetorical situations.",
      "Understand and respond to substantive issues in their writing that show global improvement through substantial and successive revision.",
      "Analyze and produce appropriate texts for a non-academic audience to demonstrate genre awareness through rhetorical conventions."
    ],
    keywords: ["research", "discourse communities", "inquiry-based", "rhetorical situations", "genre awareness", "revision", "non-academic audience"],
    requiredElements: [
      "Research-based writing assignments",
      "Source evaluation exercises",
      "Writing for different audiences",
      "Progressive drafting process",
      "Non-academic writing tasks"
    ]
  }
];

/**
 * Analyze syllabus text against Gen Ed requirements
 * @param syllabusText The extracted text from the syllabus
 * @returns AnalysisResult object containing approved and rejected requirements
 */
export async function analyzeGenEdRequirements(syllabusText: string): Promise<Partial<AnalysisResult>> {
  const approvedRequirements: ApprovedRequirement[] = [];
  const rejectedRequirements: RejectedRequirement[] = [];
  
  // Normalize the syllabus text for better matching
  const normalizedText = syllabusText.toLowerCase();
  
  // Extract course information if possible
  const courseInfo = extractCourseInfo(syllabusText);
  
  // Analyze each Gen Ed requirement
  for (const requirement of genEdRequirements) {
    const matchingReqs: string[] = [];
    const missingSLOs: number[] = [];
    const matchingSLOs: number[] = [];
    
    // Check for required elements
    for (const element of requirement.requiredElements) {
      const elementLower = element.toLowerCase();
      if (normalizedText.includes(elementLower) || 
          keywordPatternMatch(normalizedText, elementLower)) {
        matchingReqs.push(element);
      }
    }
    
    // Check for SLOs
    requirement.slos.forEach((slo, index) => {
      const sloLower = slo.toLowerCase();
      if (normalizedText.includes(sloLower) || 
          keywordPatternMatch(normalizedText, sloLower)) {
        matchingSLOs.push(index + 1);
      } else {
        missingSLOs.push(index + 1);
      }
    });
    
    // Determine if the requirement is approved
    const meetsMinimumRequirements = matchingReqs.length >= Math.ceil(requirement.requiredElements.length * 0.6) && 
                                     matchingSLOs.length >= Math.ceil(requirement.slos.length * 0.6);
    
    if (meetsMinimumRequirements) {
      approvedRequirements.push({
        name: requirement.name,
        matchingRequirements: matchingReqs,
        matchingSLOs: matchingSLOs
      });
    } else {
      rejectedRequirements.push({
        name: requirement.name,
        missingRequirements: requirement.requiredElements.filter(req => !matchingReqs.includes(req)),
        missingSLOs: missingSLOs
      });
    }
  }
  
  return {
    courseName: courseInfo.name,
    courseCode: courseInfo.code,
    approvedRequirements,
    rejectedRequirements
  };
}

/**
 * Extract course name and code from syllabus text
 * @param syllabusText The extracted text from the syllabus
 * @returns Object containing course name and code
 */
function extractCourseInfo(syllabusText: string): { name: string, code: string } {
  // Try to extract course code using regex patterns
  const courseCodeRegex = /([A-Z]{2,4})\s*(\d{3,4})[A-Z]?/g;
  const courseCodeMatches = [...syllabusText.matchAll(courseCodeRegex)];
  
  let courseCode = "";
  let courseName = "Unnamed Course";
  
  if (courseCodeMatches.length > 0) {
    const firstMatch = courseCodeMatches[0];
    courseCode = `${firstMatch[1]} ${firstMatch[2]}`;
    
    // Try to extract course name - usually follows the course code
    const courseNameRegex = new RegExp(`${courseCode}[:\\s-]*(.*?)\\n`, 'i');
    const courseNameMatch = syllabusText.match(courseNameRegex);
    
    if (courseNameMatch && courseNameMatch[1]) {
      courseName = courseNameMatch[1].trim();
    }
  }
  
  return { name: courseName, code: courseCode };
}

/**
 * Match keywords considering context and patterns
 * @param text The text to search in
 * @param pattern The pattern to search for
 * @returns boolean indicating if a match was found
 */
function keywordPatternMatch(text: string, pattern: string): boolean {
  // Split the pattern into keywords
  const keywords = pattern.split(/\s+/).filter(k => k.length > 3);
  
  // Count how many keywords are present in the text
  const matchingKeywords = keywords.filter(keyword => text.includes(keyword));
  
  // If at least 70% of important keywords are present, consider it a match
  return keywords.length > 0 && 
         (matchingKeywords.length / keywords.length) >= 0.7;
}
