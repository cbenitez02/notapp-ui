import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '../../../../core/constants/routes.constant';

@Component({
  selector: 'app-no-data-results',
  templateUrl: './no-data-results.component.html',
  styleUrls: ['./no-data-results.component.css'],
})
export class NoDataResultsComponent {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);

  public goToNewRoutine(): void {
    // Reset scroll en todos los contenedores posibles
    this.viewportScroller.scrollToPosition([0, 0]);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    // Reset scroll en el contenedor main-content (el verdadero culpable)
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Navigate
    this.router
      .navigate([Routes.NEW_ROUTINE], {
        state: { scrollToTop: true },
      })
      .then(() => {
        // Triple-check scroll reset después de navegación
        setTimeout(() => {
          this.viewportScroller.scrollToPosition([0, 0]);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

          // Reset del main-content después de la navegación
          const mainContentAfter = document.querySelector('.main-content') as HTMLElement;
          if (mainContentAfter) {
            mainContentAfter.scrollTop = 0;
          }
        }, 50);

        setTimeout(() => {
          const mainContentFinal = document.querySelector('.main-content') as HTMLElement;
          if (mainContentFinal) {
            mainContentFinal.scrollTop = 0;
          }
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 150);
      });
  }
}
