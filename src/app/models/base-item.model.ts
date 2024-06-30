export interface BaseItem {
    id: string;
    name: string;
    parentId: string | null;
    type: 'file' | 'folder';
}
