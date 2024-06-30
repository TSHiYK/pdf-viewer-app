import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { File } from '../../models/file.model';

@Component({
  selector: 'app-document-card',
  standalone: true,
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss'],
  imports: [CommonModule, DatePipe, DecimalPipe],
  providers: [DatePipe, DecimalPipe]
})
export class DocumentCardComponent {
  @Input() document!: File;
  @Output() selectDocument = new EventEmitter<string>();
  @Output() addTag = new EventEmitter<{ docId: string, tag: string }>();
  @Output() removeTag = new EventEmitter<{ docId: string, tag: string }>();
  @Output() shareDocument = new EventEmitter<{ docId: string, uid: string }>();
  @Output() deleteDocument = new EventEmitter<string>();

  constructor(private datePipe: DatePipe, private decimalPipe: DecimalPipe) { }

  convertTimestamp(timestamp: any): Date {
    if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }
    return timestamp;
  }
}
