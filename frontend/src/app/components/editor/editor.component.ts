import { Component, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorComponent as MonacoEditorComponent, MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  template: `
    <div class="panel editor-panel" [class.shake]="shake">
      <div class="panel-title">Code Editor</div>
      <div class="editor-container">
        <ngx-monaco-editor 
          [options]="editorOptions" 
          [(ngModel)]="code"
          (onInit)="onInit($event)">
        </ngx-monaco-editor>
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
      display: flex;
    }
    ngx-monaco-editor {
      width: 100%;
      height: 100%;
    }
    /* Monaco line highlight custom class */
    ::ng-deep .highlight-line {
      background: rgba(255, 255, 0, 0.2);
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
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    minimap: { enabled: false },
    automaticLayout: true
  };

  code: string = `console.log("Start");
setTimeout(() => console.log("Timeout"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("End");`;

  @Input() shake: boolean = false;
  @Output() runCode = new EventEmitter<string>();

  private editor: any;
  private currentDecorations: string[] = [];

  onInit(editor: any) {
    this.editor = editor;
  }

  highlightLine(lineNumber?: number) {
    if (!this.editor) return;

    if (!lineNumber) {
      // Clear decorations
      this.currentDecorations = this.editor.deltaDecorations(this.currentDecorations, []);
      return;
    }

    this.currentDecorations = this.editor.deltaDecorations(this.currentDecorations, [
      {
        range: new (window as any).monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'highlight-line',
          glyphMarginClassName: 'highlight-line'
        }
      }
    ]);
  }

  onRun() {
    this.runCode.emit(this.code);
  }

  onClear() {
    this.code = '';
  }
}
