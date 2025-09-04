import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-title-button-back',
  templateUrl: './title-button-back.component.html',
  styleUrls: ['./title-button-back.component.css'],
})
export class TitleButtonBackComponent {
  public title = input<string>();
  public backClick = output<void>();

  public onBack(): void {
    this.backClick.emit();
  }
}
