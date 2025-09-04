import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '../../../../core/constants/routes.constant';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css'],
})
export class ActionButtonsComponent {
  private readonly router = inject(Router);

  onCreateNewRoutine(): void {
    this.router.navigate([Routes.NEW_ROUTINE], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  onViewTodayRoutine(): void {
    this.router.navigate([Routes.ROUTINE_DETAIL], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}
