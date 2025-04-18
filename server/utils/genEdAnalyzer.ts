import { AnalysisResult, ApprovedRequirement, RejectedRequirement } from "@shared/schema";
import fs from "fs";
import path from "path";

// Define the Gen Ed requirements structure based on the PDF
export interface GenEdRequirement {
  name: string;
  description: string;
  slos: string[];
  keywords: string[];
  requiredElements: string[];
}

// Load the Gen Ed requirements data
export const genEdRequirements: GenEdRequirement[] = [
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
    name: "Natural Sciences",
    description: "Students learn scientific principles and methods to understand the natural world.",
    slos: [
      "Differentiate among facts, laws, theories, and hypotheses in the sciences.",
      "Apply scientific methods to investigate the natural world.",
      "Analyze qualitative and/or quantitative data using scientific reasoning.",
      "Evaluate claims using reliable scientific evidence."
    ],
    keywords: ["scientific methods", "natural world", "investigation", "lab work", "hypothesis", "evidence", "data"],
    requiredElements: [
      "Scientific method application",
      "Data collection and analysis",
      "Hypothesis testing",
      "Laboratory or field components",
      "Evidence-based reasoning"
    ]
  },
  {
    name: "Exploring Artistic Works",
    description: "Students evaluate and engage with artistic works in their cultural, social, and aesthetic contexts.",
    slos: [
      "Identify elements of artistic works that convey ideas, beliefs, and values of various cultures in different historical periods.",
      "Analyze artistic works using methodologies of interpretation.",
      "Create informed interpretations of artistic works using appropriate critical vocabulary.",
      "Communicate personal reactions to artistic works within informed interpretations."
    ],
    keywords: ["artistic", "aesthetic", "cultural context", "interpretation", "creative expression", "analysis", "evaluation"],
    requiredElements: [
      "Analysis of artistic works",
      "Cultural context examination",
      "Critical interpretation methods",
      "Artistic expression evaluation",
      "Critical vocabulary development"
    ]
  },
  {
    name: "Studies in Theology and Religion",
    description: "Students engage in critical reflection on religious texts, doctrines, and practices.",
    slos: [
      "Describe and analyze the content of religious texts and how they function in religious communities.",
      "Describe, analyze, and compare theological perspectives including Catholic perspectives.",
      "Analyze how religious communities interpret, interact with, and transform the world around them.",
      "Integrate theological, religious, and interdisciplinary perspectives to analyze experiences and issues."
    ],
    keywords: ["theology", "religion", "Catholic", "religious texts", "doctrines", "practices", "interdisciplinary"],
    requiredElements: [
      "Religious text analysis",
      "Theological perspectives comparison",
      "Catholic tradition examination",
      "Religious community studies",
      "Interdisciplinary approaches"
    ]
  },
  {
    name: "Creativity and Making",
    description: "Students develop creative thinking and making skills through iterative processes.",
    slos: [
      "Generate multiple approaches to problems through creative thinking.",
      "Design a process for iterative creative problem-solving.",
      "Produce a creative work through an iterative, reflective process.",
      "Evaluate the way their creative work both influences and is influenced by others."
    ],
    keywords: ["creative", "making", "iterative", "design", "reflection", "problem-solving", "innovation"],
    requiredElements: [
      "Creative process development",
      "Iterative making practices",
      "Reflective evaluation",
      "Collaborative creation",
      "Innovative problem-solving"
    ]
  },
  {
    name: "Diverse American Perspectives",
    description: "Students examine diverse cultures and perspectives in the American experience.",
    slos: [
      "Articulate the distinctive experiences and perspectives of at least one group marginalized due to racial, gender, sexual, or religious identity.",
      "Identify intersectionality, historical context, and systems of power in American society.",
      "Analyze how systemic inequality affects personal experiences and social arrangements.",
      "Evaluate how diversity and inclusion enhance society and American democracy."
    ],
    keywords: ["diversity", "American", "perspectives", "marginalized", "intersectionality", "race", "gender", "inequality"],
    requiredElements: [
      "Marginalized group experiences",
      "Systems of power analysis",
      "Intersectionality examination",
      "Diversity and inclusion concepts",
      "Historical context of inequality"
    ]
  },
  {
    name: "Global Perspectives",
    description: "Students analyze global issues and cultural diversity beyond the American experience.",
    slos: [
      "Analyze transnational cultural, economic, or political interactions.",
      "Describe and analyze cultural diversity across societies outside the United States.",
      "Analyze the cultural, historical, and/or political dimensions of regional or global issues.",
      "Evaluate how global issues and cultural diversity affect individuals and communities."
    ],
    keywords: ["global", "transnational", "international", "cultural diversity", "world perspectives", "cross-cultural", "global issues"],
    requiredElements: [
      "Non-U.S. cultural analysis",
      "International or global issues",
      "Cross-cultural comparison",
      "Transnational interactions",
      "Global diversity examination"
    ]
  },
  {
    name: "Ethics",
    description: "Students examine ethical theories and apply ethical reasoning to complex issues.",
    slos: [
      "Identify and explain philosophical theories of ethics.",
      "Analyze ethical dimensions of contemporary issues.",
      "Apply moral reasoning to complex situations.",
      "Articulate and defend ethical positions using philosophical reasoning."
    ],
    keywords: ["ethics", "moral", "philosophical", "values", "reasoning", "ethical theory", "moral judgment"],
    requiredElements: [
      "Ethical theory examination",
      "Moral reasoning application",
      "Contemporary ethical issues",
      "Philosophical analysis",
      "Values evaluation"
    ]
  },
  {
    name: "Writing Rich Mission Markers",
    description: "Students develop advanced writing skills through substantial discipline-specific writing.",
    slos: [
      "Write discipline-specific texts for multiple purposes and audiences.",
      "Incorporate appropriate conventions, genre expectations, and discipline-specific vocabulary.",
      "Integrate relevant evidence and sources with proper citation.",
      "Implement a recursive writing process involving drafting, feedback, and revision."
    ],
    keywords: ["writing", "discipline-specific", "recursive", "revision", "genres", "conventions", "citation"],
    requiredElements: [
      "Multiple substantial writing assignments",
      "Discipline-specific writing conventions",
      "Recursive writing process",
      "Feedback and revision cycles",
      "Source integration and citation"
    ]
  },
  {
    name: "Social Identities Mission Marker",
    description: "Students analyze how intersections of social identities influence individual experiences and perspectives.",
    slos: [
      "Express ways in which the intersection of social identities influence individual life experiences and perspectives.",
      "Integrate and apply course content about underrepresented cultures in interdisciplinary contexts.",
      "Articulate awareness of central historical and present diversity issues.",
      "Demonstrate knowledge of the history, customs, worldviews, and cultural markers of minority groups."
    ],
    keywords: ["social identities", "intersection", "SOGI", "race", "ethnicity", "class", "religion", "underrepresented"],
    requiredElements: [
      "Intersectionality analysis",
      "Underrepresented cultures study",
      "Historical context of diversity issues",
      "Minority group cultural examination",
      "Social identity reflection"
    ]
  },
  {
    name: "Experiential Learning for Social Justice",
    description: "Students engage in community-based experiences focused on social justice issues.",
    slos: [
      "Apply academic knowledge and skills through community-based social justice work.",
      "Analyze societal challenges and social justice issues through experiential learning.",
      "Reflect on how community-based work shapes understanding of course material and personal values.",
      "Evaluate the relationship between experiential learning and liberal arts education."
    ],
    keywords: ["experiential", "social justice", "community-based", "service learning", "reflection", "societal challenges", "community engagement"],
    requiredElements: [
      "Community-based service component",
      "Social justice focus",
      "Reflective practice",
      "Academic integration with service",
      "Structured community engagement"
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
    
    // Special criteria for Creativity and Making
    if (requirement.name === "Creativity and Making") {
      // Check if the syllabus clearly shows >50% creative content
      const creativeContentIndicators = [
        "creative writing", "theater", "design", "visual art", "studio", "workshop", "portfolio",
        "exhibition", "performance", "artistic", "sculpture", "painting", "drawing", "film",
        "photography", "dance", "music composition", "creative project"
      ];
      
      // Count occurrences of creative content indicators
      let creativeContentScore = 0;
      for (const indicator of creativeContentIndicators) {
        const regex = new RegExp(indicator, 'gi');
        const matches = normalizedText.match(regex);
        if (matches) {
          creativeContentScore += matches.length;
        }
      }
      
      // Only approve if there's substantial evidence of creative content
      if (creativeContentScore < 10) {
        rejectedRequirements.push({
          name: requirement.name,
          missingRequirements: ["More than half of course content must be dedicated to creative activities"],
          missingSLOs: missingSLOs
        });
        continue; // Skip to next requirement
      }
    }
    
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
  
  // Use exec instead of matchAll for better compatibility
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = courseCodeRegex.exec(syllabusText)) !== null) {
    matches.push(match);
  }
  
  let courseCode = "";
  let courseName = "Unnamed Course";
  
  if (matches.length > 0) {
    const firstMatch = matches[0];
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
