import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel editor-panel" [class.shake]="shake">
      <div class="panel-title">Code Editor</div>
      <div class="editor-container">
        <textarea 
          [(ngModel)]="code" 
          spellcheck="false"
          placeholder="// Type your JavaScript here..."
        ></textarea>
      </div>
      <div class="actions">
        <button (click)="onRun()">Run >></button>
        <button (click)="onClear()">Clear</button>
      </div>
    </div>
  `,
  styles: [`
    .editor-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .editor-container {
      flex-grow: 1;
      position: relative;
      background: #1e1e1e;
      overflow: hidden;
    }
    textarea {
      width: 100%;
      height: 100%;
      background: transparent;
      color: #cccccc;
      border: none;
      resize: none;
      font-family: 'Consolas', 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      padding: 10px;
      line-height: 1.5;
      outline: none;
    }
    .actions {
      margin-top: 5px;
      display: flex;
      gap: 10px;
      padding: 5px;
      background: #252526;
    }
    .shake {
      animation: shake 0.5s;
    }
    @keyframes shake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
  `]
})
export class EditorComponent {
  code: string = `console.log("Start");
setTimeout(() => console.log("Timeout"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("End");`;

  @Input() shake: boolean = false;
  @Output() runCode = new EventEmitter<string>();

  highlightLine(lineNumber?: number) {
    // Textarea lookup for line highlighting is complex. 
    // For this version, we accept we lose visual line highlighting inside the editor 
    // in exchange for a working input.
    // Future: Use a proper code mirror or overlay.
  }

  onRun() {
    this.runCode.emit(this.code);
  }

  onClear() {
    this.code = '';
  }
}
