import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-item',
  standalone: true,
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.scss'],
  imports: [CommonModule, DatePipe, DecimalPipe],
  providers: [DatePipe, DecimalPipe]
})
export class DocumentItemComponent {
  @Input() document!: Document;
  @Output() selectDocument = new EventEmitter<string>();
  @Output() addTag = new EventEmitter<{ docId: string, tag: string }>();
  @Output() removeTag = new EventEmitter<{ docId: string, tag: string }>();
  @Output() shareDocument = new EventEmitter<{ docId: string, uid: string }>();
  @Output() deleteDocument = new EventEmitter<string>();

  isExpanded: boolean = false;

  constructor(private datePipe: DatePipe, private decimalPipe: DecimalPipe) { }

  toggleChildren() {
    this.isExpanded = !this.isExpanded;
  }

  convertTimestamp(timestamp: any): Date {
    if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }
    return timestamp;
  }
}
