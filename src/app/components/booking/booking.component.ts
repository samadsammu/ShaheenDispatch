import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { StorageService } from '../../services/storage.service';
import { Vehicle, Location, Pricing } from '../../models/models';


@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.css']
})
export class BookingComponent implements AfterViewInit {
    @ViewChild('pickupInput') pickupInputRef!: ElementRef;
    @ViewChild('dropInput') dropInputRef!: ElementRef;

    pickup: Location | null = null;
    drop: Location | null = null;
    distance: number = 0;
    selectedVehicle: Vehicle | null = null;
    price: number = 0;
    vehicles: Vehicle[] = [];

    pickupResults: any[] = [];
    dropResults: any[] = [];
    private searchTimeout: any;

    currentStep: number = 1;
    senderName: string = '';
    senderPhone: string = '';
    receiverName: string = '';
    receiverPhone: string = '';

    constructor(
        private bookingService: BookingService,
        private storage: StorageService,
        private router: Router,
        private ngZone: NgZone
    ) { }

    ngOnInit() {
        this.vehicles = this.storage.getVehicles();
        if (this.vehicles.length > 0) {
            this.selectedVehicle = this.vehicles[0];
        }
    }

    ngAfterViewInit() { }

    searchLocation(event: any, type: 'pickup' | 'drop') {
        const query = event.target.value;
        if (query.length < 3) {
            if (type === 'pickup') this.pickupResults = [];
            else this.dropResults = [];
            return;
        }

        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
                .then(res => res.json())
                .then(data => {
                    this.ngZone.run(() => {
                        if (type === 'pickup') this.pickupResults = data;
                        else this.dropResults = data;
                    });
                })
                .catch(err => console.error('Nominatim error:', err));
        }, 500);
    }

    selectSearchResult(res: any, type: 'pickup' | 'drop') {
        const loc: Location = {
            address: res.display_name,
            lat: parseFloat(res.lat),
            lng: parseFloat(res.lon)
        };

        if (type === 'pickup') {
            this.pickup = loc;
            this.pickupResults = [];
            this.pickupInputRef.nativeElement.value = loc.address;
        } else {
            this.drop = loc;
            this.dropResults = [];
            this.dropInputRef.nativeElement.value = loc.address;
        }

        this.calculateDistance();
    }

    async calculateDistance() {
        if (this.pickup && this.drop) {
            try {
                // Using OSRM road distance API
                const url = `https://router.project-osrm.org/route/v1/driving/${this.pickup.lng},${this.pickup.lat};${this.drop.lng},${this.drop.lat}?overview=false`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.routes && data.routes.length > 0) {
                    this.ngZone.run(() => {
                        this.distance = data.routes[0].distance / 1000; // meters to km
                        this.updatePrice();
                    });
                } else {
                    // Fallback to straight-line distance if routing fails
                    this.fallbackDistance();
                }
            } catch (err) {
                console.error('OSRM error:', err);
                this.fallbackDistance();
            }
        }
    }

    private fallbackDistance() {
        if (!this.pickup || !this.drop) return;
        // Simple Haversine approximation or mock for demo
        const dLat = this.drop.lat - this.pickup.lat;
        const dLng = this.drop.lng - this.pickup.lng;
        this.distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // rough km
        this.updatePrice();
    }

    selectVehicle(vehicle: Vehicle) {
        this.selectedVehicle = vehicle;
        this.updatePrice();
    }

    updatePrice() {
        if (this.selectedVehicle && this.distance > 0) {
            this.price = this.bookingService.calculatePrice(this.distance, this.selectedVehicle.type);
        }
    }

    getVehiclePrice(vehicleType: string): number {
        if (this.distance > 0) {
            return this.bookingService.calculatePrice(this.distance, vehicleType);
        }
        return 0;
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    canGoToNext(): boolean {
        if (this.currentStep === 1) {
            return !!(this.pickup && this.drop);
        }
        if (this.currentStep === 2) {
            return !!(this.senderName && this.senderPhone && this.receiverName && this.receiverPhone);
        }
        return false;
    }

    confirmBooking() {
        if (this.pickup && this.drop && this.selectedVehicle && this.price > 0 &&
            this.senderName && this.senderPhone && this.receiverName && this.receiverPhone) {
            const order = this.bookingService.createOrder(
                this.pickup,
                this.drop,
                this.distance,
                this.selectedVehicle.type,
                this.price,
                {
                    senderName: this.senderName,
                    senderPhone: this.senderPhone,
                    receiverName: this.receiverName,
                    receiverPhone: this.receiverPhone
                }
            );
            this.router.navigate(['/track', order.id]);
        }
    }
}
