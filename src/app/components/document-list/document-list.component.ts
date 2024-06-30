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

import { BaseItem } from '../../models/base-item.model';
import { Folder } from '../../models/folder.model';
import { File } from '../../models/file.model';
import { buildTree } from '../../utils/tree-builder.util';
import { map, switchMap, take } from "rxjs";

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

  documents: BaseItem[] = [];
  treeDocuments: BaseItem[] = [];
  filteredTreeDocuments: BaseItem[] = [];
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
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.treeDocuments = buildTree(this.documents);
        this.filteredTreeDocuments = this.treeDocuments;
      },
      error: (error) => {
        this.showErrorMessage('Error loading documents: ' + error.message);
      }
    });
  }

  createFolder() {
    this.documentService.getDocuments().pipe(
      take(1),
      map(documents => {
        // フォルダ名の生成
        let folderIndex = 1;
        let folderName = `Folder ${folderIndex}`;
        const existingFolderNames = new Set(
          documents.filter(doc => doc['type'] === 'folder').map(doc => doc.name)
        );

        while (existingFolderNames.has(folderName)) {
          folderIndex++;
          folderName = `Folder ${folderIndex}`;
        }

        return folderName;
      }),
      switchMap(folderName => {
        const newFolder: Folder = {
          id: '',
          name: folderName,
          parentId: null,
          children: [],
          type: 'folder'
        };

        return this.documentService.addDocumentOrFolder(newFolder).pipe(
          map(() => folderName)
        );
      })
    ).subscribe({
      next: (folderName) => {
        this.loadDocuments(); // ドキュメントリストを更新
        this.showSuccessMessage(`Folder '${folderName}' created successfully.`);
      },
      error: (error: any) => {
        this.showErrorMessage('Error creating folder: ' + error.message);
      }
    });
  }


  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTreeDocuments = this.filterTree(this.treeDocuments, searchTerm);
  }

  filterTree(items: BaseItem[], searchTerm: string): BaseItem[] {
    return items.reduce((acc: BaseItem[], item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm);

      if (this.isFolder(item)) {
        const filteredChildren = this.filterTree(item.children || [], searchTerm);
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren
          } as Folder);
        }
      } else if (this.isFile(item) && matchesSearch) {
        acc.push(item);
      }

      return acc;
    }, []);
  }


  onFileUploaded(url: string) {
    this.showSuccessMessage('File uploaded successfully');
    this.loadDocuments();
  }

  onFileSelected(url: string) {
    if (typeof url === 'string') {
      this.selectedDocumentUrl = url;
    } else {
      this.selectedDocumentUrl = null;
    }
  }

  onSelectDocument(url: string) {
    if (typeof url === 'string') {
      this.selectedDocumentUrl = url;
      this.documentSelected.emit(url);
    } else {
      this.selectedDocumentUrl = null;
    }
  }

  onShareDocument(docId: string, sharedWithUid: string) {
    this.documentService.shareDocument(docId, sharedWithUid).subscribe({
      next: () => {
        this.showSuccessMessage('Document shared successfully');
      },
      error: (error: any) => {
        this.showErrorMessage('Failed to share document: ' + error.message);
      }
    });
  }

  onDeleteDocument(docId: string) {
    const doc = this.findDocumentById(this.treeDocuments, docId);
    if (this.isFile(doc)) {
      this.storageService.deleteFile(doc.fileUrl).subscribe({
        next: () => {
          this.documentService.deleteDocument(docId).subscribe({
            next: () => {
              this.removeDocumentFromTree(this.treeDocuments, docId);
              this.removeDocumentFromTree(this.filteredTreeDocuments, docId);
              this.documents = this.flattenTree(this.treeDocuments);
            },
            error: (error: any) => {
              this.showErrorMessage('Delete failed: ' + error.message);
            }
          });
        }, error: (error: any) => {
          this.showErrorMessage('Delete failed: ' + error.message);
        }
      });
    }
  }

  onAddTag(docId: string, tag: string) {
    this.documentService.addTag(docId, tag).subscribe({
      next: () => {
        const doc = this.findDocumentById(this.treeDocuments, docId);
        if (this.isFile(doc)) {
          if (!doc.tags) {
            doc.tags = [];
          }
          doc.tags.push(tag);
          this.updateFilteredTreeDocuments();
        }
        this.loadDocuments();
      },
      error: (error: any) => {
        this.showErrorMessage('Failed to add tag: ' + error.message);
      }
    });
  }

  onRemoveTag(docId: string, tag: string) {
    this.documentService.removeTag(docId, tag).subscribe({
      next: () => {
        this.loadDocuments();
      },
      error: (error: any) => {
        this.showErrorMessage('Failed to remove tag: ' + error.message);
      }
    });
  }

  private findDocumentById(documents: BaseItem[] = [], id: string): BaseItem | null {
    for (const doc of documents) {
      if (doc.id === id) {
        return doc;
      }
      if (this.isFolder(doc)) {
        const found = this.findDocumentById(doc.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private removeDocumentFromTree(documents: BaseItem[] = [], id: string): boolean {
    for (let i = 0; i < documents.length; i++) {
      if (documents[i].id === id) {
        documents.splice(i, 1);
        return true;
      }
      if (this.isFolder(documents[i])) {
        const folder = documents[i] as Folder;
        if (this.removeDocumentFromTree(folder.children, id)) {
          return true;
        }
      }
    }
    return false;
  }

  private updateFilteredTreeDocuments() {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      this.onSearch({ target: searchInput } as unknown as Event);
    }
  }

  private flattenTree(documents: BaseItem[] = []): BaseItem[] {
    return documents.reduce((flattened: BaseItem[], doc) => {
      flattened.push(doc);
      if (this.isFolder(doc)) {
        flattened = flattened.concat(this.flattenTree(doc.children));
      }
      return flattened;
    }, []);
  }

  private showSuccessMessage(message: string) {
    this.toastService.show(message, 'success');
  }

  private showErrorMessage(message: string) {
    this.toastService.show(message, 'error');
  }

  isFile(item: BaseItem | null): item is File {
    return item !== null && (item as File).fileUrl !== undefined;
  }

  isFolder(item: BaseItem): item is Folder {
    return (item as Folder).children !== undefined;
  }
}
