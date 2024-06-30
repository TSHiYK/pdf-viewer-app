import { BaseItem } from './base-item.model';

export interface Folder extends BaseItem {
    type: 'folder';
    children?: BaseItem[];
}
