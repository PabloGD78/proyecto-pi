import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // en ms, si es null se muestra indefinidamente
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();

  private currentNotificationTimeout: any;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): void {
    // Limpia el timeout anterior si existe
    if (this.currentNotificationTimeout) {
      clearTimeout(this.currentNotificationTimeout);
    }

    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };

    this.notificationSubject.next(notification);

    // Auto-limpiar después de la duración especificada
    if (duration > 0) {
      this.currentNotificationTimeout = setTimeout(() => {
        this.notificationSubject.next(null);
      }, duration);
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3500): void {
    this.show(message, 'warning', duration);
  }

  clear(): void {
    if (this.currentNotificationTimeout) {
      clearTimeout(this.currentNotificationTimeout);
    }
    this.notificationSubject.next(null);
  }
}
