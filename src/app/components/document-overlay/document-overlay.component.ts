import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-document-overlay',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="overlay">
      <button (click)="close.emit()">Close</button>
      <iframe [src]="documentUrl | safeUrl" width="100%" height="100%"></iframe>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    iframe {
      border: none;
      max-width: 90%;
      max-height: 90%;
    }
  `]
})
export class DocumentOverlayComponent {
  @Input() documentUrl: string = '';
  @Output() close = new EventEmitter<void>();
}