import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-runner-config-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="runner-grid" [formGroup]="form">
      <mat-form-field appearance="outline">
        <mat-label>Timeout (ms)</mat-label>
        <input matInput type="number" formControlName="timeoutMs" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Memory (MB)</mat-label>
        <input matInput type="number" formControlName="memoryMb" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Entry function</mat-label>
        <input matInput formControlName="entryFnName" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Node version</mat-label>
        <input matInput formControlName="nodeVersion" />
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .runner-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      @media (max-width: 960px) {
        .runner-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunnerConfigFormComponent {
  @Input({ required: true }) form!: FormGroup;
}
