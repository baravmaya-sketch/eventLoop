import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-web-api',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel">
      <div class="panel-title">Web APIs</div>
      <div class="api-container">
        <div *ngFor="let api of apis" class="api-item item-enter">
          <span class="api-name">{{ api.name }}</span>
          <span class="api-timer" *ngIf="api.remainingTime">{{ api.remainingTime }}ms</span>
        </div>
        <div *ngIf="apis.length === 0" class="empty-state">Idle</div>
      </div>
    </div>
  `,
    styles: [`
    .api-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .api-item {
      border: 1px solid var(--neon-cyan);
      padding: 5px;
      display: flex;
      justify-content: space-between;
      background: rgba(0, 255, 255, 0.1);
    }
    .empty-state {
        color: #555;
        text-align: center;
        padding-top: 20px;
    }
  `]
})
export class WebApiComponent {
    @Input() apis: { name: string, remainingTime?: number }[] = [];
}
