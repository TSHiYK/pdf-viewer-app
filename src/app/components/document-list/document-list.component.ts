import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];
  @Output() documentSelected = new EventEmitter<string>();

  constructor(private documentService: DocumentService) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getDocuments().subscribe(docs => {
      this.documents = docs;
    });
  }

  onSelectDocument(url: string) {
    this.documentSelected.emit(url);
  }

  addDocument(document: { fileUrl: string, name: string, size: number, uploadDate: Date }) {
    this.documents.push(document);
  }
}
