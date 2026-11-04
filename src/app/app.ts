import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-seed-mfe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngx-design-system ngx-labs-design' },
  imports: [NgxButton,MatButtonModule, RouterLink, RouterOutlet],
  template: `
    <header class="labs-app__header">
      <button mat-button ngxButton surface="outline" [routerLink]="['/coding-labs']">
        Coding Labs
      </button>
      <button mat-button ngxButton surface="outline" [routerLink]="['/coding-labs/new']">
        New Lab
      </button>
    </header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      .labs-app__header {
        display: flex;
        gap: 8px;
        padding: 8px 16px;
        border-bottom: 1px solid var(--ngx-color-border);
      }
    `,
  ],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
