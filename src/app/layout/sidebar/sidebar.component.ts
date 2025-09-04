import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SIDEBAR_ITEMS, SidebarItem } from './interfaces/sidebar.interfces';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);

  public readonly items: SidebarItem[] = SIDEBAR_ITEMS;

  // Signal que mantiene el estado de los elementos con hover
  private readonly hoveredItemIds = signal(new Set<number>());

  // Signal para la ruta actual (solo la ruta base sin query parameters)
  public readonly currentRoute = signal(this.router.url.split('?')[0]);

  ngOnInit(): void {
    // Escucha los cambios de navegación para actualizar la ruta actual
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      // Extraer solo la ruta base sin query parameters
      const routePath = event.url.split('?')[0];
      this.currentRoute.set(routePath);
    });
  }

  // Computed signal para obtener el ícono según el estado de hover y ruta activa
  getIcon = computed(() => {
    const hoveredIds = this.hoveredItemIds();
    const currentRoutePath = this.currentRoute();

    return (item: SidebarItem) => {
      const isActiveRoute = currentRoutePath === item.route;
      const isHovered = hoveredIds.has(item.id);

      return isActiveRoute || isHovered ? item.iconActive : item.icon;
    };
  });

  onMouseEnter(item: SidebarItem): void {
    this.hoveredItemIds.update((ids) => new Set(ids).add(item.id));
  }

  onMouseLeave(item: SidebarItem): void {
    this.hoveredItemIds.update((ids) => {
      const newIds = new Set(ids);
      newIds.delete(item.id);
      return newIds;
    });
  }

  onItemClick(item: SidebarItem): void {
    this.router.navigate([item.route]);
  }
}
