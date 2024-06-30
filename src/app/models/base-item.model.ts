export interface BaseItem {
    id: string;
    name: string;
    parentId: string | null;
    children?: BaseItem[];
    type: 'file' | 'folder';
}
