import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { ActivityLogComponent } from "./components/activity-log/activity-log.component";

export const routes: Routes = [
    { path: 'sign-up', component: SignUpComponent },
    { path: 'sign-in', component: SignInComponent },
    { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
    { path: 'edit-profile', component: UserEditComponent, canActivate: [AuthGuard] },
    { path: 'admin/users', component: UserListComponent, canActivate: [AuthGuard, AdminGuard] },
    { path: 'admin/activity-log', component: ActivityLogComponent, canActivate: [AdminGuard] },
    { path: '', redirectTo: '/documents', pathMatch: 'full' },
];
