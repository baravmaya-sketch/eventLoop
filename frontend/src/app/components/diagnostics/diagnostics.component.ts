import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LogEntry {
    type: 'error' | 'info';
    message: string;
    timestamp: string;
}

@Component({
    selector: 'app-diagnostics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="panel diagnostics-panel">
      <div class="panel-title">DIAGNOSTICS & SYSTEM LOGS</div>
      <div class="panel-content" #scrollContainer>
        <div *ngFor="let log of logs" class="log-entry" [ngClass]="log.type">
          <span class="timestamp">[{{ log.timestamp }}]</span>
          <span class="prefix" *ngIf="log.type === 'error'">[!]</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .diagnostics-panel {
      border-top: 1px solid var(--neon-red, #ff003c);
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
    }
    
    .panel-title {
        color: var(--neon-red, #ff003c) !important;
        border-bottom-color: var(--neon-red, #ff003c) !important;
    }

    .panel-content {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .log-entry {
      margin-bottom: 4px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .timestamp {
      color: #666;
      margin-right: 8px;
      font-size: 0.9em;
    }

    .log-entry.error {
      color: #FF0033;
      text-shadow: 0 0 2px rgba(255, 0, 51, 0.4);
    }

    .log-entry.info {
      color: #00F3FF; /* Cyan */
    }
    
    /* Alternating info color for variety/readability if needed, or just keep cyan */
  `]
})
export class DiagnosticsComponent implements AfterViewChecked {
    @Input() logs: LogEntry[] = [];
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
