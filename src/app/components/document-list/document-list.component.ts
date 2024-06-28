import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];
  filteredDocuments: any[] = [];
  @Output() documentSelected = new EventEmitter<string>();

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
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm) {
      this.filteredDocuments = this.documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredDocuments = this.documents;
    }
  }

  onSelectDocument(url: string) {
    this.documentSelected.emit(url);
  }

  onDeleteDocument(docId: string) {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      this.storageService.deleteFile(doc.fileUrl).subscribe({
        next: () => {
          this.documentService.deleteDocument(docId).then(() => {
            this.documents = this.documents.filter(d => d.id !== docId);
            this.filteredDocuments = this.filteredDocuments.filter(d => d.id !== docId);
          });
        },
        error: (error) => {
          console.error('Delete failed', error);
        }
      });
    }
  }
}
