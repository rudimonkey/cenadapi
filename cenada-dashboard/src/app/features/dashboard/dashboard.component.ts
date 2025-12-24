import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PriceDataService } from '../../core/services/price-data.service';
import { Product } from '../../core/models/product.model';
import { PriceRangeBarComponent } from '../../shared/components/price-range-bar/price-range-bar.component';
import { ProductDetailPanelComponent } from '../../shared/components/product-detail-panel/product-detail-panel.component';
import { BackToTopComponent } from '../../shared/components/back-to-top/back-to-top.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        CardModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        PriceRangeBarComponent,
        ProductDetailPanelComponent,
        BackToTopComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    searchValue = '';
    selectedProduct = signal<Product | null>(null);
    detailPanelVisible = signal(false);
    dataDensity = signal<'compact' | 'comfortable' | 'expanded'>('comfortable');

    constructor(public priceService: PriceDataService) { }

    ngOnInit(): void {
        this.priceService.loadPrices();
    }

    onSearch(event: any): void {
        this.priceService.setSearchTerm(event.target.value);
    }

    selectCategory(category: string): void {
        this.priceService.setCategory(category);
    }

    onProductClick(product: Product): void {
        this.selectedProduct.set(product);
        this.detailPanelVisible.set(true);
    }

    closeDetailPanel(): void {
        this.detailPanelVisible.set(false);
        setTimeout(() => this.selectedProduct.set(null), 300);
    }

    toggleDensity(): void {
        const densities: ('compact' | 'comfortable' | 'expanded')[] = ['compact', 'comfortable', 'expanded'];
        const currentIndex = densities.indexOf(this.dataDensity());
        const nextIndex = (currentIndex + 1) % densities.length;
        this.dataDensity.set(densities[nextIndex]);
    }

    getDensityIcon(): string {
        switch (this.dataDensity()) {
            case 'compact': return 'pi pi-th-large';
            case 'comfortable': return 'pi pi-table';
            case 'expanded': return 'pi pi-bars';
            default: return 'pi pi-table';
        }
    }

    getVolatilityColor(volatility: number): 'success' | 'warn' | 'danger' {
        if (volatility < 0.15) return 'success';
        if (volatility < 0.35) return 'warn';
        return 'danger';
    }

    getVolatilityLabel(volatility: number): string {
        if (volatility < 0.15) return 'Low';
        if (volatility < 0.35) return 'Medium';
        return 'High';
    }

    formatCurrency(value: number): string {
        return `₡${value.toLocaleString('es-CR')}`;
    }
}
