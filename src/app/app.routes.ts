import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'pdf-viewer',
        loadComponent: () => import('./pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent)
    },
    { path: '', redirectTo: '/pdf-viewer', pathMatch: 'full' }
];