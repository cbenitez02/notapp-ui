import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter, first } from 'rxjs/operators';
import { AlarmNotificationsComponent } from './core/components/alarm-notifications/alarm-notifications.component';
import { AlarmService } from './core/services/alarm.service';
import { AuthenticationService } from './features/auth/services/authentication.service';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, AlarmNotificationsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly alarmService = inject(AlarmService); // Inyectar para inicializar
  public showNavigation = false;

  constructor() {
    // Siempre comenzar con navegación oculta para evitar flashes
    // Se mostrará solo cuando estemos seguros de que no es una ruta de auth
    this.showNavigation = false;
  }

  ngOnInit(): void {
    document.documentElement.classList.toggle('dark-theme', true);

    // Re-verificar en ngOnInit para asegurar que el estado sea correcto
    const currentPath = window.location.pathname;
    this.showNavigation = this.shouldShowNavigation(currentPath);

    // Escucha los cambios de navegación
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.updateNavigationVisibility(event.url);
    });

    // Escucha el inicio de navegaciones para ocultar inmediatamente si es hacia auth
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      if (this.isAuthRoute(event.url)) {
        this.showNavigation = false;
      }
    });

    // Verificar la ruta inicial - usar router.navigated para asegurar que el router esté listo
    if (this.router.navigated) {
      this.updateNavigationVisibility(this.router.url);
    } else {
      // Si el router aún no ha navegado, esperar al primer NavigationEnd
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          // Tomar solo el primer evento
          first(),
        )
        .subscribe((event: NavigationEnd) => {
          this.updateNavigationVisibility(event.url);
        });
    }
  }

  private updateNavigationVisibility(url: string): void {
    // Usar la nueva lógica que considera tanto URL como autenticación
    this.showNavigation = this.shouldShowNavigation(url);
  }

  private isAuthRoute(url: string): boolean {
    return (
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/email-verification') ||
      url === '/' ||
      url === ''
    );
  }

  private shouldShowNavigation(url: string): boolean {
    // Si es una ruta de auth, nunca mostrar navegación
    if (this.isAuthRoute(url)) {
      return false;
    }

    // Si no es ruta de auth, solo mostrar si el usuario está autenticado
    return this.authService.isAuthenticated();
  }
}
