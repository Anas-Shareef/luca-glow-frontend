export type Gender = "men" | "women" | "unisex";

export type CatalogCategory =
  | "skincare-face"
  | "cleansing-soaps"
  | "lykha-makeup"
  | "fragrances"
  | "body-hair-care"
  | string;

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: CatalogCategory;
  gender: Gender;
  tags: string[]; // e.g. ["men", "unisex", "best-seller"]
  priceInr: number;
  priceAed: number | null;
  compareAtInr?: number;
  unit: string; // "50 ml", "100 g"
  unitValue: number; // numeric for filtering
  unitType: "ml" | "g" | "pack";
  inStock: boolean;
  rating: number;
  reviews: number;
  ingredients: string[];
  benefits: string[];
  description: string;
  image: string;
  imageHover: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  how_to_use: string[];
  shipping_returns: string[];
};

export type CategoryDef = {
  slug: string;
  name: string;
  description: string;
  image: string;
  match?: (p: Product) => boolean;
};
