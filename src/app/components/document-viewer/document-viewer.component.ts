import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="viewer">
      <iframe [src]="documentUrl | safeUrl" width="100%" height="100%"></iframe>
    </div>
  `,
  styles: [`
    .viewer {
      width: 100%;
      height: 100%;
    }
    iframe {
      border: none;
      width: 100%;
      height: 100%;
    }
  `]
})
export class DocumentViewerComponent {
  @Input() documentUrl: string = '';
}