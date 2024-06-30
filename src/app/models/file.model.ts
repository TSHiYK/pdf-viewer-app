import { BaseItem } from './base-item.model';

export interface File extends BaseItem {
    fileUrl: string;
    size: number;
    uploadDate: Date;
    tags: string[];
    type: 'file';
}
