import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DocumentService } from '../../services/document.service';
import { StorageService } from '../../services/storage.service';
import { UploadComponent } from '../upload/upload.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { ToastService } from '../../services/toast.service';
import { DocumentOverlayComponent } from '../document-overlay/document-overlay.component';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';
@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    SafeUrlPipe,
    DocumentOverlayComponent,
    DocumentViewerComponent
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {

  @Output() documentSelected = new EventEmitter<string>();

  documents: any[] = [];
  filteredDocuments: any[] = [];
  selectedDocumentUrl: string | null = null;
  layoutMode: 'overlay' | 'split' = 'overlay';
  isLargeScreen = false;

  constructor(
    private documentService: DocumentService,
    private storageService: StorageService,
    private toastService: ToastService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.loadDocuments();
    this.observeScreenSize();
  }

  observeScreenSize() {
    this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => {
        this.isLargeScreen = result.matches;
        this.layoutMode = this.isLargeScreen ? 'split' : 'overlay';
      });
  }

  toggleLayoutMode() {
    if (this.isLargeScreen) {
      this.layoutMode = this.layoutMode === 'overlay' ? 'split' : 'overlay';
    }
  }

  loadDocuments() {
    this.documentService.getDocuments().subscribe(
      docs => {
        console.log('Received documents:', docs); // デバッグ: 受け取ったドキュメントをログ出力
        this.documents = docs;
        this.filteredDocuments = docs;
      },
      error => {
        this.showErrorMessage('Error loading documents: ' + error.message);
      }
    );
  }

  // OR検索および部分検索を実行します。
  // ドキュメントの名前またはタグのいずれかに検索クエリが含まれている場合に一致とみなします。
  // 完全一致検索ではありません。
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.filteredDocuments = this.documents.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  }

  onFileUploaded(url: string) {
    this.showSuccessMessage('File uploaded successfully: ' + url);
    this.loadDocuments(); // ドキュメントリストを更新
  }

  onFileSelected(url: string) {
    this.selectedDocumentUrl = url; // ファイル選択時にURLを設定
  }

  onSelectDocument(url: string) {
    this.selectedDocumentUrl = url; // ドキュメントを選択して表示
    this.documentSelected.emit(url);
  }

  onShareDocument(docId: string, sharedWithUid: string) {
    this.documentService.shareDocument(docId, sharedWithUid).subscribe({
      next: () => {
        this.showSuccessMessage('Document shared successfully');
      },
      error: error => {
        this.showErrorMessage('Failed to share document: ' + error.message);
      }
    });
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
              this.showErrorMessage('Delete failed: ' + error.message);
            }
          });
        },
        error: (error) => {
          this.showErrorMessage('Delete failed: ' + error.message);
        }
      });
    }
  }

  onAddTag(docId: string, tag: string) {
    this.documentService.addTag(docId, tag).subscribe({
      next: () => {
        console.log('Tag added successfully');
        // ローカルで該当ドキュメントを更新
        const docIndex = this.documents.findIndex(doc => doc.id === docId);
        if (docIndex !== -1) {
          if (!this.documents[docIndex].tags) {
            this.documents[docIndex].tags = [];
          }
          this.documents[docIndex].tags.push(tag);
          // filteredDocuments も更新
          const filteredIndex = this.filteredDocuments.findIndex(doc => doc.id === docId);
          if (filteredIndex !== -1) {
            this.filteredDocuments[filteredIndex] = { ...this.documents[docIndex] };
          }
        }
        // 必要に応じて全ドキュメントを再読み込み
        this.loadDocuments();
      },
      error: error => {
        this.showErrorMessage('Failed to add tag: ' + error.message);
      }
    });
  }

  onRemoveTag(docId: string, tag: string) {
    this.documentService.removeTag(docId, tag).subscribe({
      next: () => {
        console.log('Tag removed successfully');
        this.loadDocuments(); // 更新後のドキュメントリストを再読み込み
      },
      error: error => {
        this.showErrorMessage('Failed to remove tag: ' + error.message);
      }
    });
  }

  private showSuccessMessage(message: string) {
    this.toastService.show(message, 'success');
  }

  private showErrorMessage(message: string) {
    this.toastService.show(message, 'error');
  }
}
