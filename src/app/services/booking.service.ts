import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Order, Location, OrderStatus } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    constructor(private storage: StorageService) { }

    calculatePrice(distanceKm: number, vehicleType: string): number {
        const pricing = this.storage.getPricing().find(p => p.vehicleType === vehicleType);
        if (!pricing) return 0;
        return pricing.baseFare + (distanceKm * pricing.perKm);
    }

    createOrder(pickup: Location, drop: Location, distance: number, vehicleType: string, price: number, contact: { senderName: string, senderPhone: string, receiverName: string, receiverPhone: string }): Order {
        const newOrder: Order = {
            id: this.storage.generateId('ORD'),
            pickup,
            drop,
            distance,
            vehicleType,
            price,
            senderName: contact.senderName,
            senderPhone: contact.senderPhone,
            receiverName: contact.receiverName,
            receiverPhone: contact.receiverPhone,
            status: 'Pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.storage.saveOrder(newOrder);
        return newOrder;
    }

    updateOrderStatus(orderId: string, status: OrderStatus, driverId?: string, driverName?: string, driverPhone?: string) {
        const order = this.storage.getOrderById(orderId);
        if (order) {
            order.status = status;
            order.updatedAt = Date.now();
            if (driverId) order.driverId = driverId;
            if (driverName) order.driverName = driverName;
            if (driverPhone) order.driverPhone = driverPhone;
            this.storage.saveOrder(order);
        }
    }

    getOrdersByStatus(status: OrderStatus): Order[] {
        return this.storage.getOrders().filter(o => o.status === status);
    }
}
