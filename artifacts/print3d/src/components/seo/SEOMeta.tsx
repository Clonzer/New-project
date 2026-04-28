import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article" | "profile";
  keywords?: string[];
  noIndex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function SEOMeta({
  title,
  description,
  canonical,
  image = "https://synthix.com/og-image.jpg",
  type = "website",
  keywords = [],
  noIndex = false,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOMetaProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        if (isProperty) {
          element.setAttribute("property", property);
        } else {
          element.setAttribute("name", property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Standard meta tags
    setMetaTag("description", description);
    if (keywords.length > 0) {
      setMetaTag("keywords", keywords.join(", "));
    }
    if (author) {
      setMetaTag("author", author);
    }

    // Robots
    if (noIndex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow");
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // Open Graph
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:image", image, true);
    setMetaTag("og:url", canonical || window.location.href, true);
    setMetaTag("og:site_name", "Synthix", true);

    // Twitter Card
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", image);

    // Article specific meta
    if (type === "article" || type === "product") {
      if (publishedTime) {
        setMetaTag("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag("article:modified_time", modifiedTime, true);
      }
      if (section) {
        setMetaTag("article:section", section, true);
      }
      if (author) {
        setMetaTag("article:author", author, true);
      }
      tags.forEach((tag) => {
        setMetaTag("article:tag", tag, true);
      });
    }

    // Viewport for mobile
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0");
      document.head.appendChild(viewport);
    }
  }, [title, description, canonical, image, type, keywords, noIndex, author, publishedTime, modifiedTime, section, tags]);

  return null;
}
