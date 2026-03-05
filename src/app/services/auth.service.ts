import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'admin' | 'driver' | null;

export interface UserSession {
    id: string;
    name: string;
    role: UserRole;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        const savedUser = localStorage.getItem('shaheen_user');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    login(role: UserRole, id: string = 'root', name: string = ''): boolean {
        // Basic mock authentication
        let session: UserSession | null = null;

        if (role === 'admin') {
            session = { id: 'admin-001', name: 'System Admin', role: 'admin' };
        } else if (role === 'driver') {
            session = { id, name: name || 'Driver', role: 'driver' };
        }

        if (session) {
            localStorage.setItem('shaheen_user', JSON.stringify(session));
            this.currentUserSubject.next(session);
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('shaheen_user');
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserSubject.value;
    }

    getRole(): UserRole {
        return this.currentUserSubject.value?.role || null;
    }

    getUserId(): string | null {
        return this.currentUserSubject.value?.id || null;
    }
}
