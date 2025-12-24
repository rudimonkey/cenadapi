import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Bulletin, PriceStats } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class PriceDataService {
    private bulletinData = signal<Bulletin | null>(null);
    private searchTerm = signal<string>('');
    private selectedCategory = signal<string>('All');

    // Computed signals for reactive data
    products = computed(() => this.bulletinData()?.products || []);

    filteredProducts = computed(() => {
        let products = this.products();
        const search = this.searchTerm().toLowerCase();
        const category = this.selectedCategory();

        if (search) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.unit.toLowerCase().includes(search)
            );
        }

        if (category !== 'All') {
            products = products.filter(p => p.category === category);
        }

        return products;
    });

    stats = computed<PriceStats>(() => {
        const products = this.products();

        if (products.length === 0) {
            return {
                mostExpensive: null,
                cheapest: null,
                highestVolatility: null,
                totalProducts: 0
            };
        }

        // Helper to get normalized price (per-kilo if available, otherwise raw price)
        const getNormalizedPrice = (p: Product, useMin: boolean): number => {
            if (p.pricePerKilo) return p.pricePerKilo;
            return useMin ? p.priceMin : p.priceMax;
        };

        // Most expensive based on normalized per-kilo pricing
        const mostExpensive = products.reduce((max, p) => {
            const currentPrice = getNormalizedPrice(p, false);
            const maxPrice = getNormalizedPrice(max, false);
            return currentPrice > maxPrice ? p : max;
        }, products[0]);

        // Cheapest based on normalized per-kilo pricing
        const cheapest = products.reduce((min, p) => {
            const currentPrice = getNormalizedPrice(p, true);
            const minPrice = getNormalizedPrice(min, true);
            return currentPrice < minPrice ? p : min;
        }, products[0]);

        const highestVolatility = products.reduce((max, p) =>
            p.volatilityIndex > (max?.volatilityIndex || 0) ? p : max
            , products[0]);

        return {
            mostExpensive,
            cheapest,
            highestVolatility,
            totalProducts: products.length
        };
    });

    categories = computed(() => {
        const products = this.products();
        const categorySet = new Set<string>();
        products.forEach(p => {
            if (p.category) {
                categorySet.add(p.category);
            }
        });
        return ['All', ...Array.from(categorySet).sort()];
    });

    constructor(private http: HttpClient) { }

    loadPrices(): void {
        this.http.get<Bulletin>('/assets/data/current-prices.json')
            .subscribe({
                next: (data) => {
                    this.bulletinData.set(data);
                },
                error: (error) => {
                    console.error('Error loading prices:', error);
                }
            });
    }

    setSearchTerm(term: string): void {
        this.searchTerm.set(term);
    }

    setCategory(category: string): void {
        this.selectedCategory.set(category);
    }

    getSelectedCategory(): string {
        return this.selectedCategory();
    }

    getBulletinDate(): string {
        return this.bulletinData()?.date || '';
    }
}
