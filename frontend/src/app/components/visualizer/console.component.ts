import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-console',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel">
      <div class="panel-title">Console</div>
      <div class="console-output">
        <div *ngFor="let log of logs" class="log-line">
          <span class="prompt">></span> {{ log }}
        </div>
      </div>
    </div>
  `,
    styles: [`
    .console-output {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      height: calc(100% - 30px);
      overflow-y: auto;
    }
    .log-line {
      border-bottom: 1px solid #222;
      padding: 2px 0;
    }
    .prompt {
      color: var(--neon-green);
      margin-right: 5px;
    }
  `]
})
export class ConsoleComponent {
    @Input() logs: string[] = [];
}
