export interface Order {
    id: string;
    pickup: Location;
    drop: Location;
    distance: number;
    vehicleType: string;
    price: number;
    status: OrderStatus;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Location {
    address: string;
    lat: number;
    lng: number;
}

export type OrderStatus = 'Pending' | 'Driver Assigned' | 'Arrived at Pickup' | 'Picked Up' | 'On The Way' | 'Delivered' | 'Cancelled';

export interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    status: 'Active' | 'Inactive'; // Keep for backward compatibility if needed
    active: boolean; // Use this for cleaner logic in templates
    currentOrderId?: string;
    lastKnownLocation?: {
        lat: number;
        lng: number;
    };
}

export interface Vehicle {
    type: string;
    name: string;
    icon: string;
    capacity: string;
}

export interface Pricing {
    vehicleType: string;
    baseFare: number;
    perKm: number;
}

export const DEFAULT_PRICING: Pricing[] = [
    { vehicleType: 'Bike', baseFare: 30, perKm: 10 },
    { vehicleType: 'Auto', baseFare: 50, perKm: 15 },
    { vehicleType: 'Mini Truck', baseFare: 150, perKm: 25 },
    { vehicleType: 'Pickup Truck', baseFare: 250, perKm: 40 },
];

export const VEHICLES: Vehicle[] = [
    { type: 'Bike', name: 'Bike', icon: 'motorcycle', capacity: 'Small parcels' },
    { type: 'Auto', name: 'Auto', icon: 'three_wheeler', capacity: 'Medium parcels' },
    { type: 'Mini Truck', name: 'Mini Truck', icon: 'local_shipping', capacity: 'Heavy goods' },
    { type: 'Pickup Truck', name: 'Pickup Truck', icon: 'truck', capacity: 'Oversized goods' },
];
