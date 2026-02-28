import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-call-stack',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel">
      <div class="panel-title">Call Stack</div>
      <div class="stack-container">
        <div *ngFor="let frame of frames" class="stack-frame item-enter">
          {{ frame }}
        </div>
        <div *ngIf="frames.length === 0" class="empty-state">Stack Empty</div>
      </div>
    </div>
  `,
    styles: [`
    .stack-container {
      display: flex;
      flex-direction: column-reverse; /* Stack grows up */
      height: calc(100% - 30px);
      gap: 5px;
    }
    .stack-frame {
      border: 1px solid var(--neon-green);
      padding: 5px;
      background: rgba(0, 255, 0, 0.1);
      text-align: center;
      font-weight: bold;
    }
    .empty-state {
      color: #555;
      text-align: center;
      margin-top: auto;
      margin-bottom: auto;
    }
  `]
})
export class CallStackComponent {
    @Input() frames: string[] = []; // Example: ['main()', 'foo()']
}
