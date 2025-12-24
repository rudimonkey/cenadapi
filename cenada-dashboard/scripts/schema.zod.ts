import { z } from 'zod';

/**
 * Product Schema - Defines the structure for individual agricultural product pricing
 */
export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
    priceMin: z.number(),
    priceMax: z.number(),
    mode: z.number(),
    average: z.number(),
    pricePerKilo: z.number().optional(),
    volatilityIndex: z.number(), // (max - min) / average
    category: z.enum(['Vegetable', 'Fruit', 'Tuber', 'Protein', 'Other']),
    weightKg: z.number().optional(), // Extracted weight for Malla/Caja units
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Bulletin Schema - Defines the structure for the complete pricing bulletin
 */
export const BulletinSchema = z.object({
    date: z.string(),
    source: z.literal('PIMA-CENADA'),
    products: z.array(ProductSchema),
});

export type Bulletin = z.infer<typeof BulletinSchema>;
