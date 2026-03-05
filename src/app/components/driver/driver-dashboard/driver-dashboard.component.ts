import { Component, OnInit, OnDestroy, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Order, Driver, OrderStatus } from '../../../models/models';
import * as L from 'leaflet';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './driver-dashboard.component.html',
    styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    auth = inject(AuthService);
    storage = inject(StorageService);
    bookingService = inject(BookingService);

    driver: Driver | null = null;
    stats: any = null;
    availableOrders: Order[] = [];
    activeOrder: Order | null = null;
    private refreshInterval: any;

    // Map Properties
    private map: L.Map | undefined;
    private driverMarker: L.Marker | undefined;
    private pickupMarker: L.Marker | undefined;
    private dropMarker: L.Marker | undefined;
    private routeLine: L.Polyline | undefined;
    private mockDriverPos = { lat: 12.9716, lng: 77.5946 }; // Default Bangalore
    private moveInterval: any;
    private watchId: number | undefined;
    isUsingRealLocation = false;

    ngOnInit() {
        const driverId = this.auth.getUserId();
        if (driverId) {
            const drivers = this.storage.getDrivers();
            this.driver = drivers.find(d => d.id === driverId) || null;

            this.refreshData();
            this.requestLocationAccess();

            // Start polling every 3 seconds for live updates
            this.refreshInterval = setInterval(() => {
                this.refreshData();
            }, 3000);
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initMap();
        }, 100);
    }

    ngOnDestroy() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        if (this.moveInterval) clearInterval(this.moveInterval);
        if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
        if (this.map) this.map.remove();
    }

    requestLocationAccess() {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.isUsingRealLocation = true;
                    this.mockDriverPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateMarkers();
                    // If no active navigation, center map on user
                    if (!this.activeOrder && this.map) {
                        this.map.setView([this.mockDriverPos.lat, this.mockDriverPos.lng], 15);
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    this.isUsingRealLocation = false;
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    }

    locateMe() {
        if (this.map) {
            this.map.setView([this.mockDriverPos.lat, this.mockDriverPos.lng], 16);
        }
    }

    private initMap() {
        if (this.map || !this.mapContainer) return;

        this.map = L.map(this.mapContainer.nativeElement, {
            zoomControl: false
        }).setView([this.mockDriverPos.lat, this.mockDriverPos.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        this.updateMarkers();
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
            const prevActiveId = this.activeOrder?.id;
            this.activeOrder = this.storage.getOrders().find(o =>
                o.driverId === this.driver?.id &&
                (o.status as any) !== 'Delivered' &&
                (o.status as any) !== 'Cancelled'
            ) || null;

            if (this.activeOrder) {
                if (prevActiveId !== this.activeOrder.id) {
                    this.startNavigation();
                }
                this.updateMarkers();
            } else {
                this.stopNavigation();
                this.updateMarkers();
            }
        }
    }

    private updateMarkers() {
        if (!this.map) return;

        // Driver Marker
        const driverIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: var(--primary); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 0 10px rgba(229, 57, 53, 0.5);"><span class="material-icons-outlined" style="font-size: 16px;">local_shipping</span></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        if (!this.driverMarker) {
            this.driverMarker = L.marker([this.mockDriverPos.lat, this.mockDriverPos.lng], { icon: driverIcon }).addTo(this.map);
        } else {
            this.driverMarker.setLatLng([this.mockDriverPos.lat, this.mockDriverPos.lng]);
        }

        if (this.activeOrder) {
            // Pickup Marker
            const pickupIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            if (!this.pickupMarker) {
                this.pickupMarker = L.marker([this.activeOrder.pickup.lat, this.activeOrder.pickup.lng], { icon: pickupIcon }).addTo(this.map);
            } else {
                this.pickupMarker.setLatLng([this.activeOrder.pickup.lat, this.activeOrder.pickup.lng]);
            }

            // Drop Marker
            const dropIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: white; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--primary); box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            if (!this.dropMarker) {
                this.dropMarker = L.marker([this.activeOrder.drop.lat, this.activeOrder.drop.lng], { icon: dropIcon }).addTo(this.map);
            } else {
                this.dropMarker.setLatLng([this.activeOrder.drop.lat, this.activeOrder.drop.lng]);
            }

            // Route Polyline
            const target = (this.activeOrder.status === 'Driver Assigned' || this.activeOrder.status === 'Arrived at Pickup')
                ? this.activeOrder.pickup
                : this.activeOrder.drop;

            const path = [
                [this.mockDriverPos.lat, this.mockDriverPos.lng],
                [target.lat, target.lng]
            ] as L.LatLngExpression[];

            if (!this.routeLine) {
                this.routeLine = L.polyline(path, { color: 'var(--primary)', weight: 3, opacity: 0.6, dashArray: '5, 10' }).addTo(this.map);
            } else {
                this.routeLine.setLatLngs(path);
            }

            // Adjust view to show both points
            const bounds = L.latLngBounds([
                [this.mockDriverPos.lat, this.mockDriverPos.lng],
                [target.lat, target.lng]
            ]);
            this.map.fitBounds(bounds, { padding: [40, 40] });

        } else {
            if (this.pickupMarker) { this.pickupMarker.remove(); this.pickupMarker = undefined; }
            if (this.dropMarker) { this.dropMarker.remove(); this.dropMarker = undefined; }
            if (this.routeLine) { this.routeLine.remove(); this.routeLine = undefined; }
        }
    }

    private startNavigation() {
        if (this.moveInterval) clearInterval(this.moveInterval);
        if (this.isUsingRealLocation) return;

        this.moveInterval = setInterval(() => {
            if (this.activeOrder && !this.isUsingRealLocation) {
                const target = (this.activeOrder.status === 'Driver Assigned' || this.activeOrder.status === 'Arrived at Pickup')
                    ? this.activeOrder.pickup
                    : this.activeOrder.drop;

                const step = 0.0003; // Speed
                const dLat = target.lat - this.mockDriverPos.lat;
                const dLng = target.lng - this.mockDriverPos.lng;
                const dist = Math.sqrt(dLat * dLat + dLng * dLng);

                if (dist > step) {
                    this.mockDriverPos.lat += (dLat / dist) * step;
                    this.mockDriverPos.lng += (dLng / dist) * step;
                    this.updateMarkers();
                }
            }
        }, 1000);
    }

    private stopNavigation() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = undefined;
        }
    }

    acceptOrder(orderId: string) {
        if (this.driver) {
            this.bookingService.updateOrderStatus(orderId, 'Driver Assigned', this.driver.id, this.driver.name, this.driver.phone);
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
