export interface Document {
    id: string;
    name: string;
    fileUrl: string;
    size: number;
    uploadDate: Date;
    tags: string[];
    parentId: string | null;
    children?: Document[];
}