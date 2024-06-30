import { BaseItem } from '../models/base-item.model';
import { Folder } from "../models/folder.model";

export function buildTree(items: BaseItem[]): BaseItem[] {
    const map = new Map<string, BaseItem>();
    const roots: BaseItem[] = [];

    items.forEach(item => {
        map.set(item.id, item);
        if (!item.parentId) {
            roots.push(item);
        } else {
            const parent = map.get(item.parentId);
            if (parent && isFolder(parent)) {
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
            }
        }
    });

    return roots;
}

function isFolder(item: BaseItem): item is Folder {
    return item.type === 'folder';
}