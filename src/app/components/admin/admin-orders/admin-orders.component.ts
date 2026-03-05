import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { BookingService } from '../../../services/booking.service';
import { Order, Driver } from '../../../models/models';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
    orders: Order[] = [];
    showModal = false;
    selectedOrder: Order | null = null;
    availableDrivers: Driver[] = [];
    private refreshInterval: any;

    constructor(
        private storage: StorageService,
        private bookingService: BookingService
    ) { }

    ngOnInit() {
        this.loadData();
        // Poll for updates every 3 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 3000);
    }

    ngOnDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadData() {
        this.orders = this.storage.getOrders().sort((a, b) => b.createdAt - a.createdAt);
        this.availableDrivers = this.storage.getDrivers().filter(d => d.active);
    }

    openAssignModal(order: Order) {
        this.selectedOrder = order;
        this.showModal = true;
    }

    assignDriver(driver: Driver) {
        if (this.selectedOrder) {
            this.bookingService.updateOrderStatus(this.selectedOrder.id, 'Driver Assigned', driver.id, driver.name);
            this.loadData();
            this.showModal = false;
        }
    }

    cancelOrder(id: string) {
        if (confirm('Cancel this order?')) {
            this.bookingService.updateOrderStatus(id, 'Cancelled');
            this.loadData();
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Pending': return 'badge-warning';
            case 'Driver Assigned':
            case 'Picked Up':
            case 'On The Way': return 'badge-info';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return '';
        }
    }
}
