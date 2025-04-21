/**
 * Utility for mapping Gen Ed requirements to consistent colors throughout the application
 */

export type RequirementColors = {
  bgColorClass: string;
  textColorClass: string;
};

/**
 * Maps a requirement name to consistent color classes
 * @param requirementName The name of the Gen Ed requirement
 * @returns Object with bgColorClass and textColorClass
 */
export function getRequirementColors(requirementName: string): RequirementColors {
  // Map each requirement to a specific color to ensure legibility
  switch(requirementName) {
    // Core requirements
    case "Quantitative Reasoning":
      return {
        bgColorClass: "bg-blue-100",
        textColorClass: "text-blue-800"
      };
    case "Modern Language":
      return {
        bgColorClass: "bg-emerald-100",
        textColorClass: "text-emerald-800"
      };
    case "Natural Sciences":
      return {
        bgColorClass: "bg-teal-100",
        textColorClass: "text-teal-800"
      };
    case "Exploring Artistic Works":
      return {
        bgColorClass: "bg-purple-100",
        textColorClass: "text-purple-800"
      };
    case "Studies in Theology and Religion":
      return {
        bgColorClass: "bg-yellow-100",
        textColorClass: "text-yellow-800"
      };
    case "Creativity and Making":
      return {
        bgColorClass: "bg-rose-100",
        textColorClass: "text-rose-800"
      };
    
    // Additional requirements
    case "Diverse American Perspectives":
      return {
        bgColorClass: "bg-amber-100",
        textColorClass: "text-amber-800"
      };
    case "Global Perspectives":
      return {
        bgColorClass: "bg-indigo-100",
        textColorClass: "text-indigo-800"
      };
    case "Ethics":
    case "Ethical Reasoning":
      return {
        bgColorClass: "bg-cyan-100",
        textColorClass: "text-cyan-800"
      };
    
    // Mission markers
    case "Writing Rich Mission Marker":
      return {
        bgColorClass: "bg-lime-100",
        textColorClass: "text-lime-800"
      };
    case "Social Identities Mission Marker":
      return {
        bgColorClass: "bg-pink-100",
        textColorClass: "text-pink-800"
      };
    case "Experiential Learning for Social Justice":
      return {
        bgColorClass: "bg-violet-100",
        textColorClass: "text-violet-800"
      };
    
    // Other requirements
    case "Historical Perspectives":
      return {
        bgColorClass: "bg-orange-100",
        textColorClass: "text-orange-800"
      };
    case "Scientific Inquiry":
      return {
        bgColorClass: "bg-green-100",
        textColorClass: "text-green-800"
      };
    case "Information Literacy":
      return {
        bgColorClass: "bg-sky-100",
        textColorClass: "text-sky-800"
      };
    case "Critical Thinking":
      return {
        bgColorClass: "bg-red-100",
        textColorClass: "text-red-800"
      };
    
    // Default for any other requirements
    default:
      return {
        bgColorClass: "bg-neutral-200",
        textColorClass: "text-neutral-800"
      };
  }
}