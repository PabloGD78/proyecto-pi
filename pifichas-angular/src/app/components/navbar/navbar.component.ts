import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  userInitials = 'WA';
  isGestionActive = true;
  isReportsActive = false;
  showLogout = true; // Nueva propiedad

  constructor(private router: Router, private auth: AuthService) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    // Ejecutamos la lógica una vez al cargar por si entramos directamente a una URL
    this.updateActiveButton(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveButton(event.urlAfterRedirects || event.url);
      });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private updateActiveButton(url: string): void {
    this.isGestionActive = url.includes('/home');
    this.isReportsActive = url.includes('/reports');
    
    // Si la URL contiene 'login' o es la raíz, ocultamos el botón
    this.showLogout = !(url.includes('/login') || url === '/');
  }
}