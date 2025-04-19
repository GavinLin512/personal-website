// --- Type Definitions ---

// Interface for a single row from the CSV
export interface Row {
	id: number;
	gender: string;
	masterCategory: string;
	subCategory: string;
	articleType: string;
	baseColour: string;
	season: string;
	year: number;
	usage: string;
	productDisplayName: string;
}

// Define the structure for product variants
interface Variant {
	gender: string;
	baseColour: string;
	year: number; // Assuming year is always present after parsing
	season: string; // Assuming season is always present after parsing
	usage: string; // Assuming usage is always present after parsing
	image: string; // Image identifier based on record id
}

// Define the structure for a product, containing its variants
interface Product {
	variants: {
		[variantSlug: string]: Variant;
	};
}

// Define the nested map structure for clarity
type ArticleTypeMap = {
	[articleType: string]: { [productName: string]: Product };
};
type SubCategoryMap = { [subCategory: string]: ArticleTypeMap };
export type MasterCategoryMap = { [masterCategory: string]: SubCategoryMap };

// Final result structure type
export type ProductHierarchy = MasterCategoryMap;