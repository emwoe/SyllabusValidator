import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RequirementInfo {
  name: string;
  description: string;
  slos: string[];
}

// A subset of requirements shown initially
const initialRequirements: RequirementInfo[] = [
  {
    name: "Freshmen Seminar",
    description: "Students will join a community of learners and actively engage in academic and co-curricular exploration.",
    slos: [
      "Identify assumptions rooted in a variety of perspectives.",
      "Interpret and evaluate issues, evidence, and sources.",
      "Communicate effectively about multiple perspectives.",
      "Reflect on and apply knowledge developed in the classroom and co-curricular experiences."
    ]
  },
  {
    name: "Quantitative Reasoning",
    description: "Students must use mathematical, statistical, and/or computational methods to analyze and solve problems involving quantitative information.",
    slos: [
      "Interpret quantitative information.",
      "Use quantitative methods to solve problems.",
      "Develop conclusions based on quantitative analysis."
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
    ]
  }
];

// Full list of all requirements
const allRequirements: RequirementInfo[] = [
  ...initialRequirements,
  {
    name: "Oral Communication",
    description: "Students develop professional speech structure and delivery techniques for effective presentations.",
    slos: [
      "Employ a professional speech structure that reinforces the central message of the presentation.",
      "Communicate a central message effectively through insightful word choice and creative selection of appropriate rhetorical devices.",
      "Deploy a variety of appropriate delivery tools to engage the audience.",
      "Offer varied and relevant evidence to support their credibility."
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
    ]
  },
  {
    name: "Exploring Artistic Works",
    description: "Students analyze, interpret, and appreciate creative works through critical engagement with artistic forms.",
    slos: [
      "Identify and interpret elements of artistic expression in various media.",
      "Apply theoretical frameworks to evaluate creative works.",
      "Articulate how creative works reflect diverse cultural and historical contexts.",
      "Demonstrate understanding of the creative process through analysis or participation."
    ]
  },
  {
    name: "Diverse American Perspectives",
    description: "Students engage with diverse cultural, social, and historical experiences of American communities.",
    slos: [
      "Analyze how diverse identities, experiences, and structures shape American society.",
      "Identify the historical foundations and contemporary manifestations of inequality in the United States.",
      "Recognize and critically examine one's own perspectives in relation to diverse American communities.",
      "Apply interdisciplinary approaches to understanding complex social issues in American contexts."
    ]
  },
  {
    name: "Global Perspectives",
    description: "Students examine diverse global worldviews, systems, and interactions to develop cross-cultural understanding.",
    slos: [
      "Compare and contrast perspectives, practices, and experiences across different cultural contexts.",
      "Analyze global issues from multiple cultural, historical, and geopolitical viewpoints.",
      "Evaluate how global systems and processes affect people across different societies.",
      "Demonstrate awareness of how one's own cultural position shapes understanding of global contexts."
    ]
  },
  {
    name: "Scientific Inquiry",
    description: "Students apply scientific methods to investigate natural phenomena and evaluate empirical evidence.",
    slos: [
      "Demonstrate understanding of scientific theories, concepts, and models.",
      "Design and conduct investigations using appropriate scientific methods.",
      "Analyze and interpret scientific data using quantitative and qualitative approaches.",
      "Evaluate scientific information and claims based on methodological validity and reliability."
    ]
  },
  {
    name: "Creativity and Making",
    description: "Students engage in creative processes to produce original work and develop creative problem-solving skills.",
    slos: [
      "Generate original ideas or works through creative experimentation and iteration.",
      "Apply appropriate techniques, tools, or methods in the creative process.",
      "Critically evaluate creative work using discipline-specific criteria.",
      "Articulate how creativity contributes to knowledge generation and problem-solving."
    ]
  },
  {
    name: "Ethical Reasoning",
    description: "Students examine ethical frameworks, principles, and dilemmas to develop thoughtful moral reasoning.",
    slos: [
      "Identify and analyze ethical issues in various contexts.",
      "Apply ethical theories and frameworks to evaluate complex moral problems.",
      "Construct and defend ethical arguments with reasoned justification.",
      "Evaluate the implications of decisions and actions on diverse stakeholders."
    ]
  },
  {
    name: "Historical Perspectives",
    description: "Students analyze historical contexts and processes to understand how past events shape contemporary issues.",
    slos: [
      "Identify and explain significant historical developments, events, and patterns.",
      "Analyze primary and secondary historical sources using appropriate methodologies.",
      "Evaluate how historical narratives are constructed and contested.",
      "Apply historical perspectives to interpret contemporary issues and challenges."
    ]
  }
];

export default function RequirementsGuide() {
  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  const toggleRequirement = (name: string) => {
    setExpandedRequirements(prev => 
      prev.includes(name) 
        ? prev.filter(r => r !== name)
        : [...prev, name]
    );
  };
  
  const toggleShowAll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default anchor behavior
    setShowAll(prev => !prev);
  };
  
  // Use the appropriate requirements list based on showAll state
  const displayRequirements = showAll ? allRequirements : initialRequirements;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Gen Ed Requirements</h2>
        
        <div className="space-y-4">
          {displayRequirements.map((req: RequirementInfo) => (
            <div 
              key={req.name}
              className="border border-neutral-100 rounded-lg overflow-hidden shadow-sm"
            >
              <button 
                className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleRequirement(req.name)}
              >
                <span className="font-medium text-neutral-900">{req.name}</span>
                <span className={`material-icons text-neutral-400 transform ${expandedRequirements.includes(req.name) ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div 
                className={`px-4 pb-3 pt-0 border-t border-neutral-100 ${
                  expandedRequirements.includes(req.name) ? 'block' : 'hidden'
                }`}
              >
                <div className="prose prose-sm max-w-none text-neutral-600">
                  <p className="text-sm">{req.description}</p>
                  <h4 className="text-sm font-medium mt-2">Student Learning Outcomes:</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    {req.slos.map((slo: string, index: number) => (
                      <li key={`${req.name}-slo-${index}`}>{slo}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center mt-2">
            <a 
              href="#" 
              className="text-primary text-sm font-medium hover:text-primary/80"
              onClick={toggleShowAll}
            >
              {showAll ? "Show fewer requirements ←" : "View all requirements →"}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}