import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [MatButtonModule, RouterLink, RouterOutlet],
  template: `
    <header class="header">
      <button mat-button [routerLink]="['/coding-labs']">
        Coding Labs
      </button>
      <button mat-button [routerLink]="['/coding-labs/new']">
        New Lab
      </button>
    </header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      .header {
        display: flex;
        gap: 8px;
        padding: 8px 16px;
        border-bottom: 1px solid #e1e5ec;
      }
    `,
  ],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
