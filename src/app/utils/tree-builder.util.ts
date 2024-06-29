import { Document } from '../models/document.model';

export function buildTree(items: Document[]): Document[] {
    const itemMap = new Map<string, Document>();

    // 各アイテムに children 配列を追加
    items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
    });

    const rootItems: Document[] = [];

    itemMap.forEach(item => {
        if (item.parentId === null) {
            rootItems.push(item);
        } else {
            const parent = itemMap.get(item.parentId);
            if (parent && parent.children) {
                parent.children.push(item);
            } else {
                rootItems.push(item);
            }
        }
    });

    return rootItems;
}