/**
 * Category configuration for product classification
 * Maintainable mapping of product keywords to categories
 */

export type ProductCategory = 'Vegetable' | 'Fruit' | 'Tuber' | 'Protein' | 'Other';

export interface CategoryMapping {
    category: ProductCategory;
    keywords: string[];
}

/**
 * Category mappings based on product name keywords
 * Add new keywords here as needed
 */
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
    {
        category: 'Vegetable',
        keywords: [
            'apio', 'brócoli', 'brocoli', 'coliflor', 'repollo',
            'lechuga', 'chile', 'tomate', 'cebolla', 'zanahoria',
            'vainica', 'espinaca', 'ayote', 'calabaza', 'chayote',
            'pepino', 'remolacha', 'rábano', 'cilantro', 'perejil',
            'elote', 'maíz'
        ]
    },
    {
        category: 'Fruit',
        keywords: [
            'banano', 'banana', 'plátano', 'piña', 'papaya',
            'mango', 'sandía', 'melón', 'naranja', 'limón',
            'mandarina', 'fresa', 'uva', 'manzana', 'pera',
            'guayaba', 'cas', 'maracuyá', 'carambola', 'granadilla'
        ]
    },
    {
        category: 'Tuber',
        keywords: [
            'papa', 'yuca', 'camote', 'ñame', 'ñampí',
            'tiquisque', 'jengibre', 'malanga'
        ]
    },
    {
        category: 'Protein',
        keywords: [
            'huevo', 'carne', 'pollo', 'pescado', 'res',
            'cerdo', 'pavo', 'atún', 'tilapia'
        ]
    }
];

/**
 * Categorizes a product based on its name
 * @param name Product name
 * @returns ProductCategory
 */
export function categorizeProduct(name: string): ProductCategory {
    const nameLower = name.toLowerCase();

    for (const mapping of CATEGORY_MAPPINGS) {
        if (mapping.keywords.some(keyword => nameLower.includes(keyword))) {
            return mapping.category;
        }
    }

    return 'Other';
}

/**
 * Extracts weight in kilograms from unit strings
 * Examples: "Malla (45 kg)" -> 45, "Caja (20 kg)" -> 20
 * @param unit Unit string
 * @returns Weight in kg or null if not found
 */
export function extractWeightKg(unit: string): number | null {
    const match = unit.match(/\((\d+)\s*kg\)/i);
    return match ? parseInt(match[1], 10) : null;
}
