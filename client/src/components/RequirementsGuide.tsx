import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RequirementInfo {
  name: string;
  description: string;
  slos: string[];
}

const requirements: RequirementInfo[] = [
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
  },
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
    
    // If showing all, expand all requirements, otherwise collapse all
    if (!showAll) {
      setExpandedRequirements(requirements.map(req => req.name));
    } else {
      setExpandedRequirements([]);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Gen Ed Requirements</h2>
        
        <div className="space-y-4">
          {requirements.map((req) => (
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
                    {req.slos.map((slo, index) => (
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
              {showAll ? "Collapse all requirements" : "View all requirements →"}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
