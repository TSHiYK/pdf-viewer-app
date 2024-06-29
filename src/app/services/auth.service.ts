import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User as FirebaseUser, updateProfile, updateEmail, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, query, where, collection, updateDoc, getDoc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { switchMap, map, tap, shareReplay } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.currentUser$ = this.initCurrentUser().pipe(shareReplay(1));
  }

  private initCurrentUser(): Observable<User | null> {
    return authState(this.auth).pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          return this.getUserData(firebaseUser.uid).pipe(
            map(userData => ({
              ...userData,
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName
            }) as User)
          );
        }
        return of(null);
      })
    );
  }

  private getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDocRef)).pipe(
      map(userDoc => userDoc.exists() ? userDoc.data() as User : null)
    );
  }

  signUp(email: string, password: string, organizationId?: string): Observable<any> {
    return from((async () => {
      const userCollection = collection(this.firestore, 'users');
      let role = 'user';

      if (!organizationId) {
        organizationId = uuidv4();
        role = 'admin';
      } else {
        const q = query(userCollection, where('organizationId', '==', organizationId));
        const userDocs = await getDocs(q);
        if (userDocs.empty) {
          role = 'admin';
        }
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(this.firestore, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        role,
        organizationId
      });

      return userCredential;
    })());
  }

  signIn(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  updateUserProfile(userData: Partial<User>): Observable<void> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('No authenticated user');
        }

        const updates: Promise<void>[] = [];

        if (userData.displayName) {
          updates.push(updateProfile(this.auth.currentUser!, { displayName: userData.displayName }));
        }

        if (userData.email) {
          updates.push(updateEmail(this.auth.currentUser!, userData.email));
        }

        if (userData.role) {
          updates.push(updateDoc(doc(this.firestore, `users/${user.uid}`), { role: userData.role }));
        }

        return from(Promise.all(updates).then(() => void 0));
      }),
      tap(() => this.refreshCurrentUser())
    );
  }

  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role === 'admin')
    );
  }

  private refreshCurrentUser(): void {
    this.currentUser$ = this.initCurrentUser().pipe(shareReplay(1));
  }
}