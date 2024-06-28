import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { StorageService } from '../../services/storage.service';
import { UploadComponent } from '../upload/upload.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, UploadComponent, SafeUrlPipe],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];
  filteredDocuments: any[] = [];
  @Output() documentSelected = new EventEmitter<string>();
  selectedDocumentUrl: string | null = null;

  constructor(
    private documentService: DocumentService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getDocuments().subscribe(docs => {
      this.documents = docs;
      this.filteredDocuments = docs; // 初期状態では全てのドキュメントを表示
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.filteredDocuments = this.documents.filter(doc => doc.name.toLowerCase().includes(query));
  }

  onFileUploaded(url: string) {
    console.log('File uploaded successfully:', url);
    this.loadDocuments(); // ドキュメントリストを更新
  }

  onFileSelected(url: string) {
    this.selectedDocumentUrl = url; // ファイル選択時にURLを設定
  }

  onSelectDocument(url: string) {
    this.selectedDocumentUrl = url; // ドキュメントを選択して表示
    this.documentSelected.emit(url);
  }

  onDeleteDocument(docId: string) {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      this.storageService.deleteFile(doc.fileUrl).subscribe({
        next: () => {
          this.documentService.deleteDocument(docId).subscribe({
            next: () => {
              this.documents = this.documents.filter(d => d.id !== docId);
              this.filteredDocuments = this.filteredDocuments.filter(d => d.id !== docId);
            },
            error: (error) => {
              console.error('Delete failed', error);
            }
          });
        },
        error: (error) => {
          console.error('Delete failed', error);
        }
      });
    }
  }
}
