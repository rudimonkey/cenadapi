import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../../core/models/product.model';
import { PriceRangeBarComponent } from '../price-range-bar/price-range-bar.component';

@Component({
    selector: 'app-product-detail-panel',
    standalone: true,
    imports: [CommonModule, ButtonModule, PriceRangeBarComponent],
    templateUrl: './product-detail-panel.component.html',
    styleUrls: ['./product-detail-panel.component.scss']
})
export class ProductDetailPanelComponent {
    @Input() product: Product | null = null;
    @Input() visible: boolean = false;
    @Output() close = new EventEmitter<void>();

    closePanel() {
        this.close.emit();
    }

    formatCurrency(value: number): string {
        return `₡${value.toLocaleString('es-CR')}`;
    }
}
