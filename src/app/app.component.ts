import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, DocumentListComponent, SafeUrlPipe],
  template: `
    <app-upload (fileUploaded)="onFileUploaded($event)" (fileSelected)="onFileSelected($event)"></app-upload>
    <app-document-list #docList (documentSelected)="onDocumentSelected($event)"></app-document-list>
    <iframe *ngIf="selectedDocumentUrl" [src]="selectedDocumentUrl | safeUrl" width="100%" height="500px"></iframe>
  `,
})
export class AppComponent {
  selectedDocumentUrl: string | null = null;
  @ViewChild('docList') documentListComponent!: DocumentListComponent;

  onFileUploaded(url: string) {
    console.log('File uploaded successfully:', url);
    this.documentListComponent.loadDocuments(); // ドキュメントリストを更新
  }

  onFileSelected(url: string) {
    this.selectedDocumentUrl = url; // ファイル選択時にURLを設定
  }

  onDocumentSelected(url: string) {
    this.selectedDocumentUrl = url; // ドキュメントを選択して表示
  }
}
