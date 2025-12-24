export interface Product {
    id: string;
    name: string;
    unit: string;
    priceMin: number;
    priceMax: number;
    mode: number;
    average: number;
    pricePerKilo?: number;
    volatilityIndex: number;
    category: 'Vegetable' | 'Fruit' | 'Tuber' | 'Protein' | 'Other';
    weightKg?: number;
}

export interface Bulletin {
    date: string;
    source: 'PIMA-CENADA';
    products: Product[];
}

export interface PriceStats {
    mostExpensive: Product | null;
    cheapest: Product | null;
    highestVolatility: Product | null;
    totalProducts: number;
}
