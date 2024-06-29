import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DocumentService } from '../../services/document.service';
import { StorageService } from '../../services/storage.service';
import { UploadComponent } from '../upload/upload.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { ToastService } from '../../services/toast.service';
import { DocumentOverlayComponent } from '../document-overlay/document-overlay.component';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { DocumentItemComponent } from '../document-item/document-item.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { Document } from '../../models/document.model';
import { buildTree } from '../../utils/tree-builder.util';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    SafeUrlPipe,
    DocumentOverlayComponent,
    DocumentViewerComponent,
    DocumentCardComponent,
    DocumentItemComponent,
    DatePipe,
    DecimalPipe,
    FontAwesomeModule
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {

  @Output() documentSelected = new EventEmitter<string>();

  documents: Document[] = [];
  treeDocuments: Document[] = [];
  filteredTreeDocuments: Document[] = [];
  selectedDocumentUrl: string | null = null;
  viewMode: 'card' | 'tree' = 'tree';
  layoutMode: 'overlay' | 'split' = 'overlay';
  isLargeScreen = false;

  constructor(
    private documentService: DocumentService,
    private storageService: StorageService,
    private toastService: ToastService,
    private breakpointObserver: BreakpointObserver,
    private library: FaIconLibrary
  ) { library.addIconPacks(fas); }

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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'tree' ? 'card' : 'tree';
  }

  toggleLayoutMode() {
    if (this.isLargeScreen) {
      this.layoutMode = this.layoutMode === 'overlay' ? 'split' : 'overlay';
    }
  }

  loadDocuments() {
    this.documentService.getDocuments().subscribe(
      docs => {
        this.documents = docs;
        this.treeDocuments = buildTree(this.documents);
        this.filteredTreeDocuments = this.treeDocuments;
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
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTreeDocuments = this.filterTree(this.treeDocuments, searchTerm);
  }

  filterTree(items: Document[], searchTerm: string): Document[] {
    return items.reduce((acc: Document[], item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      if (matchesSearch) {
        acc.push({ ...item, children: item.children ? this.filterTree(item.children, searchTerm) : [] });
      } else if (item.children && item.children.length > 0) {
        const filteredChildren = this.filterTree(item.children, searchTerm);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      }

      return acc;
    }, []);
  }

  onFileUploaded(url: string) {
    this.showSuccessMessage('File uploaded successfully');
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
    const doc = this.findDocumentById(this.treeDocuments, docId);
    if (doc) {
      this.storageService.deleteFile(doc.fileUrl).subscribe({
        next: () => {
          this.documentService.deleteDocument(docId).subscribe({
            next: () => {
              this.removeDocumentFromTree(this.treeDocuments, docId);
              this.removeDocumentFromTree(this.filteredTreeDocuments, docId);
              this.documents = this.flattenTree(this.treeDocuments);
            },
            error: (error) => {
              this.showErrorMessage('Delete failed: ' + error.message);
            }
          });
        }, error: (error) => {
          this.showErrorMessage('Delete failed: ' + error.message);
        }
      });
    }
  }

  onAddTag(docId: string, tag: string) {
    this.documentService.addTag(docId, tag).subscribe({
      next: () => {
        const doc = this.findDocumentById(this.treeDocuments, docId);
        if (doc) {
          if (!doc.tags) {
            doc.tags = [];
          }
          doc.tags.push(tag);
          this.updateFilteredTreeDocuments();
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
        this.loadDocuments(); // 更新後のドキュメントリストを再読み込み
      },
      error: error => {
        this.showErrorMessage('Failed to remove tag: ' + error.message);
      }
    });
  }

  private findDocumentById(documents: Document[] = [], id: string): Document | null {
    for (const doc of documents) {
      if (doc.id === id) {
        return doc;
      }
      if (doc.children) {
        const found = this.findDocumentById(doc.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private removeDocumentFromTree(documents: Document[] = [], id: string): boolean {
    for (let i = 0; i < documents.length; i++) {
      if (documents[i].id === id) {
        documents.splice(i, 1);
        return true;
      }
      if (documents[i].children) {
        if (this.removeDocumentFromTree(documents[i].children, id)) {
          return true;
        }
      }
    }
    return false;
  }

  private updateFilteredTreeDocuments() {
    // 検索条件に基づいてフィルタリングを再適用
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      this.onSearch({ target: searchInput } as any);
    }
  }

  private flattenTree(documents: Document[] = []): Document[] {
    let flattened: Document[] = [];
    for (const doc of documents) {
      flattened.push(doc);
      if (doc.children) {
        flattened = flattened.concat(this.flattenTree(doc.children));
      }
    }
    return flattened;
  }

  private showSuccessMessage(message: string) {
    this.toastService.show(message, 'success');
  }

  private showErrorMessage(message: string) {
    this.toastService.show(message, 'error');
  }
}
