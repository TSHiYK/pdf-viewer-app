import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { DocumentService } from '../../services/document.service';
import { BaseItem } from "../../models/base-item.model";

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  @Output() fileUploaded = new EventEmitter<string>();
  @Output() fileSelected = new EventEmitter<string>();
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  uploadProgress: number | null = null;

  constructor(
    private storageService: StorageService,
    private documentService: DocumentService
  ) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileUrl = URL.createObjectURL(this.selectedFile);
      this.fileSelected.emit(this.selectedFileUrl);
      this.uploadFile();
    } else {
      this.selectedFile = null;
      this.selectedFileUrl = null;
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      const filePath = `pdfs/${Date.now()}_${this.selectedFile.name}`;
      const fileSize = this.selectedFile.size; // ファイルサイズを取得
      this.storageService.uploadFile(this.selectedFile, filePath).subscribe({
        next: progressOrUrl => {
          if (typeof progressOrUrl === 'number') {
            this.uploadProgress = progressOrUrl;
          } else {
            this.uploadProgress = null;
            const document = {
              fileUrl: progressOrUrl,
              name: this.selectedFile!.name,
              size: fileSize,
              uploadDate: new Date()
            };
            this.documentService.addDocumentOrFolder(document as any).subscribe({
              next: () => {
                this.fileUploaded.emit(progressOrUrl);
                this.selectedFile = null;
              },
              error: error => {
                console.error('Failed to save document metadata', error);
              }
            });
          }
        },
        error: error => {
          console.error('Upload failed', error);
        }
      });
    } else {
      console.error('No file selected');
    }
  }
}
