import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { AuthGuard } from './guards/auth.guard';
import { UploadComponent } from './components/upload/upload.component';

export const routes: Routes = [
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
    { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/sign-in', pathMatch: 'full' }
];
