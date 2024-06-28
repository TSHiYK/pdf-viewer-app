import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { PLATFORM_CHECK } from '../platform-check.token';

declare global {
  interface Window {
    AdobeDC: any;
  }
}

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  template: `
    <div class="spectrum-Panel">
      <div class="spectrum-Panel-item">
        <h2 class="spectrum-Heading spectrum-Heading--sizeM">PDF Viewer</h2>
      </div>
      <div class="spectrum-Panel-item">
        <div #pdfViewer id="pdf-viewer" class="pdf-container"></div>
      </div>
    </div>
  `,
  styleUrls: ['./pdf-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfViewer', { static: true }) pdfViewer!: ElementRef<HTMLDivElement>;

  private clientId = environment.adobeClientId;

  constructor(@Inject(PLATFORM_CHECK) private isPlatformBrowser: () => boolean) { }

  ngOnInit() {
    console.log('PDF Viewer Component initialized');
  }

  ngAfterViewInit() {
    console.log('View initialized, checking platform');
    if (this.isPlatformBrowser()) {
      console.log('Running in browser environment, initializing PDF viewer');
      this.initPdfViewer();
    } else {
      console.log('Not in browser environment, skipping PDF viewer initialization');
    }
  }

  private initPdfViewer() {
    console.log('Initializing PDF viewer');
    if (typeof window !== 'undefined' && window.AdobeDC) {
      console.log('Adobe DC API found, creating view');
      const adobeDCView = new window.AdobeDC.View({
        clientId: this.clientId,
        divId: 'pdf-viewer'
      });

      console.log('Preview file');
      adobeDCView.previewFile({
        content: { location: { url: 'https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf' } },
        metaData: { fileName: 'Bodea Brochure.pdf' }
      }, {});
    } else {
      console.error('Adobe PDF Embed API is not loaded or not in browser environment');
    }
  }
}