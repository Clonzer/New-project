// Image Alt Text Utility for SEO
// Generates descriptive, keyword-rich alt text for marketplace images

interface ListingImageAltProps {
  productName: string;
  vendorName?: string;
  material?: string;
  category?: string;
  viewType?: "main" | "detail" | "angle" | "scale" | "in-use";
  index?: number;
}

interface VendorImageAltProps {
  vendorName: string;
  imageType: "logo" | "banner" | "portfolio" | "workshop";
  service?: string;
  index?: number;
}

/**
 * Generate SEO-friendly alt text for product listing images
 * 
 * Examples:
 * - "Custom 3D printed articulated dragon in PLA filament by MakerX - front view"
 * - "Laser cut wooden jewelry box detail shot by ArtisanStudio"
 * - "3D printed robot model scale comparison with ruler by TechPrints"
 */
export function generateListingImageAlt({
  productName,
  vendorName,
  material,
  category,
  viewType = "main",
  index = 0,
}: ListingImageAltProps): string {
  const parts: string[] = [];
  
  // Product name (always included)
  parts.push(productName);
  
  // Material
  if (material) {
    parts.push(`in ${material}`);
  }
  
  // Category context
  if (category && !productName.toLowerCase().includes(category.toLowerCase())) {
    parts.push(`${category} service`);
  }
  
  // Vendor attribution
  if (vendorName) {
    parts.push(`by ${vendorName}`);
  }
  
  // View type description
  const viewDescriptions: Record<string, string> = {
    main: index === 0 ? "product photo" : "alternate view",
    detail: "detail shot",
    angle: `angle view ${index + 1}`,
    scale: "size comparison",
    "in-use": "in use demonstration",
  };
  
  if (viewType !== "main" || index > 0) {
    parts.push(viewDescriptions[viewType] || "view");
  }
  
  const altText = parts.join(" ").trim();
  
  // Ensure it's not too long (max 125 characters for optimal SEO)
  if (altText.length > 125) {
    return altText.substring(0, 122) + "...";
  }
  
  return altText;
}

/**
 * Generate SEO-friendly alt text for vendor shop images
 * 
 * Examples:
 * - "MakerX 3D printing shop logo and branding"
 * - "ArtisanStudio laser cutting workshop banner - custom fabrication services"
 * - "TechPrints portfolio piece 1 - 3D printed mechanical parts"
 */
export function generateVendorImageAlt({
  vendorName,
  imageType,
  service,
  index = 0,
}: VendorImageAltProps): string {
  const parts: string[] = [];
  
  // Vendor name (always included)
  parts.push(vendorName);
  
  // Service type
  if (service) {
    parts.push(`${service} services`);
  }
  
  // Image type description
  const typeDescriptions: Record<string, string> = {
    logo: "shop logo and branding",
    banner: "shop banner and header image",
    portfolio: `portfolio piece ${index + 1}`,
    workshop: "workshop and equipment photo",
  };
  
  parts.push(typeDescriptions[imageType] || "shop image");
  
  const altText = parts.join(" ").trim();
  
  // Truncate if too long
  if (altText.length > 125) {
    return altText.substring(0, 122) + "...";
  }
  
  return altText;
}

/**
 * Generate alt text for category/hero images
 */
export function generateCategoryImageAlt(
  category: string,
  context?: string
): string {
  if (context) {
    return `${category} - ${context}`.substring(0, 125);
  }
  return `${category} products and services on Synthix marketplace`.substring(0, 125);
}

/**
 * Generate alt text for user avatars
 */
export function generateAvatarAlt(
  username: string,
  isVendor: boolean = false
): string {
  if (isVendor) {
    return `${username} - vendor shop profile picture`;
  }
  return `${username} user profile picture`;
}

/**
 * Validate alt text for SEO best practices
 */
export function validateAltText(altText: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!altText || altText.trim().length === 0) {
    issues.push("Alt text is empty");
  }
  
  if (altText.length > 125) {
    issues.push("Alt text exceeds 125 characters (may be truncated)");
  }
  
  if (altText.toLowerCase().startsWith("image of") || altText.toLowerCase().startsWith("picture of")) {
    suggestions.push("Remove 'image of' or 'picture of' - screen readers already announce it's an image");
  }
  
  if (altText.includes(".jpg") || altText.includes(".png") || altText.includes(".gif")) {
    issues.push("Alt text contains file extension");
  }
  
  if (/^\d+$/.test(altText)) {
    issues.push("Alt text is only numbers (not descriptive)");
  }
  
  if (altText.toLowerCase() === "image" || altText.toLowerCase() === "photo") {
    issues.push("Alt text is too generic");
  }
  
  // Check for keyword stuffing
  const words = altText.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 2)
    .map(([word]) => word);
  
  if (repeatedWords.length > 0) {
    suggestions.push(`Possible keyword stuffing: "${repeatedWords.join(", ")}" appears multiple times`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Batch generate alt texts for product gallery
 */
export function generateGalleryAltTexts(
  productName: string,
  vendorName: string,
  material?: string,
  category?: string,
  totalImages: number = 5
): string[] {
  const viewTypes: Array<"main" | "detail" | "angle" | "scale" | "in-use"> = [
    "main",
    "angle",
    "detail",
    "scale",
    "in-use",
  ];
  
  return Array.from({ length: totalImages }, (_, index) =>
    generateListingImageAlt({
      productName,
      vendorName,
      material,
      category,
      viewType: viewTypes[index] || "angle",
      index,
    })
  );
}
