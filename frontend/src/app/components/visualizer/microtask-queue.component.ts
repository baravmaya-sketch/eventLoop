import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-microtask-queue',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel">
      <div class="panel-title">Microtask Queue</div>
      <div class="queue-container">
        <div *ngFor="let task of tasks" class="queue-item item-enter">
          {{ task }}
        </div>
        <div *ngIf="tasks.length === 0" class="empty-state">Empty</div>
      </div>
    </div>
  `,
    styles: [`
    .queue-container {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      padding-bottom: 5px;
    }
    .queue-item {
      border: 1px dashed var(--neon-green);
      padding: 5px;
      min-width: 80px;
      text-align: center;
      background: rgba(0, 255, 0, 0.05);
    }
    .empty-state {
        color: #555;
        padding: 5px;
    }
  `]
})
export class MicrotaskQueueComponent {
    @Input() tasks: string[] = [];
}
