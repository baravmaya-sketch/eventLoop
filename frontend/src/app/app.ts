import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './components/editor/editor.component';
import { CallStackComponent } from './components/visualizer/call-stack.component';
import { WebApiComponent } from './components/visualizer/web-api.component';
import { MicrotaskQueueComponent } from './components/visualizer/microtask-queue.component';
import { MacrotaskQueueComponent } from './components/visualizer/macrotask-queue.component';
import { ConsoleComponent } from './components/visualizer/console.component';
import { DiagnosticsComponent, LogEntry } from './components/diagnostics/diagnostics.component';
import { SnippetService } from './services/snippet.service';
import { SimulationService, Frame } from './services/simulation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    EditorComponent,
    CallStackComponent,
    WebApiComponent,
    MicrotaskQueueComponent,
    MacrotaskQueueComponent,
    ConsoleComponent
  ],
  template: `
    <div class="main-container" [class.system-failure]="hasError">
      <header>
        <h1>Stack & Loop <span class="blink">_</span></h1>
        <div class="controls">
          <label>Speed: 
            <select (change)="setSpeed($event)" [disabled]="isPlaying">
               <option value="1500">Slow</option>
               <option value="800" selected>Normal</option>
               <option value="200">Fast</option>
            </select>
          </label>
          <button (click)="run()" [disabled]="isPlaying">Run >></button>
        </div>
      </header>
      
      <div class="workspace">
        <div class="left-pane">
          <app-editor [shake]="hasError" (runCode)="handleRunCode($event)"></app-editor>
        </div>

        <div class="right-pane">
          <div class="top-row">
            <div class="col">
              <app-call-stack [frames]="currentFrame?.callStack || []"></app-call-stack>
            </div>
            <div class="col">
              <app-web-api [apis]="currentFrame?.webApis || []"></app-web-api>
            </div>
          </div>
          
          <div class="middle-row">
            <div class="col">
              <app-microtask-queue [tasks]="currentFrame?.microtasks || []"></app-microtask-queue>
            </div>
            <div class="col">
              <app-macrotask-queue [tasks]="currentFrame?.macrotasks || []"></app-macrotask-queue>
            </div>
          </div>

          <div class="bottom-split">
            <div class="console-area">
                <app-console [logs]="currentFrame?.consoleLogs || []"></app-console>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Modal -->
      <div *ngIf="hasError" class="error-modal-overlay" (click)="dismissError()">
        <div class="error-modal">
            <div class="error-title">SYSTEM FAILURE</div>
            <div class="error-msg">{{ errorMessage }}</div>
            <br>
            <div style="font-size: 0.8em">[ CLICK TO REBOOT ]</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--dark-bg);
      transition: all 0.5s;
    }
    header {
      padding: 0 10px;
      height: 40px;
      background-color: #333333;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      color: var(--accent-color);
      font-size: 1.1rem;
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    h1::before {
        content: '';
        display: inline-block;
        width: 15px;
        height: 15px;
        background: var(--accent-color);
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    .blink { animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    .controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    select {
        background: black;
        color: var(--neon-green);
        border: 1px solid var(--neon-green);
        padding: 5px;
        font-family: var(--font-mono);
    }
    
    select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: #555;
        color: #888;
    }

    .workspace {
      flex-grow: 1;
      display: flex;
      overflow: hidden;
    }
    
    .left-pane {
      width: 50%; /* Expanded as requested */
      min-width: 400px;
      padding: 5px;
      display: flex;
      flex-direction: column;
    }
    
    .right-pane {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      padding: 5px;
      gap: 5px;
    }

    .top-row { height: 35%; display: flex; gap: 5px; }
    .middle-row { height: 120px; display: flex; gap: 5px; }
    
    .bottom-split {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-height: 0; /* Enable shrinking */
    }

    .console-area {
        flex-grow: 1;
        min-height: 100px;
    }
    
    .col {
      flex: 1;
      min-width: 0; 
    }
  `]
})
export class AppComponent {
  @ViewChild(EditorComponent) editorByView!: EditorComponent;

  frames: Frame[] = [];
  currentFrameIndex: number = -1;
  errorMessage: string = '';
  hasError: boolean = false;
  isPlaying: boolean = false;
  playbackSpeed: number = 800;

  diagnosticsLogs: LogEntry[] = [];

  // Timer reference
  private playTimer: any;

  get currentFrame(): Frame | null {
    if (this.currentFrameIndex < 0 || this.currentFrameIndex >= this.frames.length) return null;
    return this.frames[this.currentFrameIndex];
  }

  constructor(
    private snippetService: SnippetService,
    private simulationService: SimulationService
  ) {
    this.setupSecurity();
    this.addLog('info', 'System Initialized. Ready for input.');
  }

  setupSecurity() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => {
      if (event.key === 'F12') event.preventDefault();
      if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) event.preventDefault();
      if (event.ctrlKey && (event.key === 'U' || event.key === 'u')) event.preventDefault();
    });
  }

  handleRunCode(code: string) {
    this.runSimulation(code);
  }

  run() {
    if (this.editorByView) {
      if (this.frames.length === 0 || this.currentFrameIndex >= this.frames.length - 1) {
        this.runSimulation(this.editorByView.code, true);
      } else {
        this.isPlaying = true;
        this.autoPlay();
      }
    }
  }

  runSimulation(code: string, autoPlay: boolean = true) {
    this.reset();
    this.addLog('info', 'Starting simulation sequence...');
    try {
      this.frames = this.simulationService.run(code);
      if (this.frames.length > 0) {
        this.addLog('info', `Simulation successful. Generated ${this.frames.length} frames.`);
        this.currentFrameIndex = 0;
        this.updateEditorHighlight();
        if (autoPlay) {
          this.isPlaying = true;
          this.autoPlay();
        }
      } else {
        this.addLog('info', 'Simulation finished with no frames.');
      }
    } catch (e: any) {
      this.hasError = true;
      this.errorMessage = e.message;
      this.addLog('error', `Runtime Error: ${e.message}`);
      console.error(e);
      if (this.editorByView) this.editorByView.shake = true;
    }
  }

  autoPlay() {
    if (!this.isPlaying) return;

    this.playTimer = setTimeout(() => {
      if (this.currentFrameIndex < this.frames.length - 1) {
        this.currentFrameIndex++;
        this.updateEditorHighlight();
        this.autoPlay();
      } else {
        this.isPlaying = false;
        this.addLog('info', 'Simulation sequence complete.');
      }
    }, this.playbackSpeed);
  }

  reset() {
    this.isPlaying = false;
    clearTimeout(this.playTimer);
    this.currentFrameIndex = -1;
    this.frames = [];
    this.hasError = false;
    this.errorMessage = '';
    if (this.editorByView) this.editorByView.highlightLine(undefined);
    // don't clear logs on reset? maybe a separator?
    this.addLog('info', '--- State Reset ---');
  }

  updateEditorHighlight() {
    if (!this.editorByView || !this.currentFrame) return;
    this.editorByView.highlightLine(this.currentFrame.highlightLine);
  }

  setSpeed(event: any) {
    this.playbackSpeed = parseInt(event.target.value, 10);
    this.addLog('info', `Playback speed set to ${this.playbackSpeed}ms`);
  }

  dismissError() {
    this.hasError = false;
  }

  addLog(type: 'error' | 'info', message: string) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    this.diagnosticsLogs.push({ type, message, timestamp });
  }
}
