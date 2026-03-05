import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Order, Driver, OrderStatus } from '../../../models/models';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './driver-dashboard.component.html'
})
export class DriverDashboardComponent implements OnInit {
    auth = inject(AuthService);
    storage = inject(StorageService);
    bookingService = inject(BookingService);

    driver: Driver | null = null;
    stats: any = null;
    availableOrders: Order[] = [];
    activeOrder: Order | null = null;
    private refreshInterval: any;

    ngOnInit() {
        const driverId = this.auth.getUserId();
        if (driverId) {
            const drivers = this.storage.getDrivers();
            this.driver = drivers.find(d => d.id === driverId) || null;
            this.refreshData();

            // Start polling every 3 seconds for live updates
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, 3000);
        }
    }

    ngOnDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    private refreshData() {
        this.loadStats();
        this.loadOrders();
        this.checkCurrentOrder();
    }

    loadStats() {
        if (this.driver) {
            this.stats = this.storage.getDriverStats(this.driver.id);
        }
    }

    loadOrders() {
        if (!this.driver) return;

        const normalize = (name: string) => name.toLowerCase().split('(')[0].trim();
        const driverVehicle = normalize(this.driver.vehicleType);

        // Pending orders that match driver's vehicle type
        this.availableOrders = this.storage.getOrders().filter(o =>
            (o.status as any) === 'Pending' && normalize(o.vehicleType) === driverVehicle
        );
    }

    checkCurrentOrder() {
        if (this.driver) {
            this.activeOrder = this.storage.getOrders().find(o =>
                o.driverId === this.driver?.id &&
                (o.status as any) !== 'Delivered' &&
                (o.status as any) !== 'Cancelled'
            ) || null;
        }
    }

    acceptOrder(orderId: string) {
        if (this.driver) {
            this.bookingService.updateOrderStatus(orderId, 'Driver Assigned', this.driver.id, this.driver.name);
            this.loadOrders();
            this.checkCurrentOrder();
        }
    }

    updateStatus(status: any) {
        if (this.activeOrder) {
            this.bookingService.updateOrderStatus(this.activeOrder.id, status);
            this.checkCurrentOrder();
            if (status === 'Delivered') {
                this.loadOrders();
                this.loadStats();
            }
        }
    }

    getAvailableStatuses(): string[] {
        if (!this.activeOrder) return [];
        const currentStatus = this.activeOrder.status as any;
        switch (currentStatus) {
            case 'Driver Assigned': return ['Arrived at Pickup'];
            case 'Arrived at Pickup': return ['Picked Up'];
            case 'Picked Up': return ['On The Way'];
            case 'On The Way': return ['Delivered'];
            default: return [];
        }
    }
}
