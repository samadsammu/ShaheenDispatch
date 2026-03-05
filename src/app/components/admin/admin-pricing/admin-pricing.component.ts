import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { Pricing } from '../../../models/models';

@Component({
    selector: 'app-admin-pricing',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-pricing.component.html'
})
export class AdminPricingComponent implements OnInit {
    pricing: Pricing[] = [];

    constructor(private storage: StorageService) { }

    ngOnInit() {
        this.pricing = this.storage.getPricing();
    }

    savePricing() {
        this.storage.updatePricing(this.pricing);
        alert('Pricing updated successfully!');
    }
}
