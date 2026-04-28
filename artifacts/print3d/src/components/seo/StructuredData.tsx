import { useEffect } from "react";

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Synthix",
  url: "https://synthix.com",
  logo: "https://synthix.com/logo.png",
  description: "The premier marketplace for 3D printing services, laser cutting, and maker tools. Connect with skilled makers and find custom fabrication services.",
  sameAs: [
    "https://twitter.com/synthix",
    "https://facebook.com/synthix",
    "https://instagram.com/synthix",
    "https://linkedin.com/company/synthix",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-800-SYNTHIX",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Product Schema Generator
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  price: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  seller?: {
    name: string;
    url?: string;
  };
  brand?: string;
  sku?: string;
  mpn?: string;
  category?: string;
  reviews?: {
    rating: number;
    count: number;
  };
  material?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: string;
  };
}

export function generateProductSchema({
  name,
  description,
  image,
  price,
  priceCurrency = "USD",
  availability = "InStock",
  seller,
  brand,
  sku,
  mpn,
  category,
  reviews,
  material,
  dimensions,
}: ProductSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency,
      availability: `https://schema.org/${availability}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    },
  };

  if (seller) {
    schema.offers.seller = {
      "@type": "Organization",
      name: seller.name,
      url: seller.url,
    };
  }

  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand,
    };
  }

  if (sku) schema.sku = sku;
  if (mpn) schema.mpn = mpn;
  if (category) schema.category = category;
  if (material) schema.material = material;

  if (dimensions) {
    schema.width = {
      "@type": "QuantitativeValue",
      value: dimensions.width,
      unitCode: dimensions.unit,
    };
    schema.height = {
      "@type": "QuantitativeValue",
      value: dimensions.height,
      unitCode: dimensions.unit,
    };
    if (dimensions.depth) {
      schema.depth = {
        "@type": "QuantitativeValue",
        value: dimensions.depth,
        unitCode: dimensions.unit,
      };
    }
  }

  if (reviews && reviews.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.rating,
      reviewCount: reviews.count,
    };
  }

  return schema;
}

// LocalBusiness Schema for Vendor Shops
interface VendorSchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  email?: string;
  telephone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  rating?: {
    value: number;
    count: number;
  };
  services?: string[];
}

export function generateVendorSchema({
  name,
  description,
  image,
  url,
  email,
  telephone,
  address,
  geo,
  rating,
  services = [],
}: VendorSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    image,
    url,
    "@id": url,
  };

  if (email) schema.email = email;
  if (telephone) schema.telephone = telephone;

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: address.country,
    };
  }

  if (geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  if (rating && rating.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.value,
      reviewCount: rating.count,
    };
  }

  if (services.length > 0) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    };
  }

  return schema;
}

// Main StructuredData Component
interface StructuredDataProps {
  schema: object | object[];
}

export function StructuredData({ schema }: StructuredDataProps) {
  useEffect(() => {
    const schemas = Array.isArray(schema) ? schema : [schema];
    
    // Remove existing structured data scripts with our data attribute
    const existingScripts = document.querySelectorAll('script[data-structured-data="true"]');
    existingScripts.forEach((script) => script.remove());

    // Add new scripts
    schemas.forEach((s) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-structured-data", "true");
      script.text = JSON.stringify(s);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll('script[data-structured-data="true"]');
      scripts.forEach((script) => script.remove());
    };
  }, [schema]);

  return null;
}

// Predefined marketplace schemas
export function MarketplaceStructuredData() {
  return <StructuredData schema={organizationSchema} />;
}
