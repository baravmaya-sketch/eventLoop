import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-macrotask-queue',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel">
      <div class="panel-title">Callback Queue (Macro)</div>
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
      border: 1px dashed var(--neon-cyan);
      padding: 5px;
      min-width: 80px;
      text-align: center;
      background: rgba(0, 255, 255, 0.05);
    }
    .empty-state {
        color: #555;
        padding: 5px;
    }
  `]
})
export class MacrotaskQueueComponent {
    @Input() tasks: string[] = [];
}
