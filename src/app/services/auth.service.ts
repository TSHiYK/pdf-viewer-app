import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDocs, query, where, collection } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) { }

  signUp(email: string, password: string, organizationId?: string): Observable<any> {
    return from((async () => {
      const userCollection = collection(this.firestore, 'users');
      let role = 'user';

      if (!organizationId) {
        // 初期管理者として新しいorganizationIdを生成
        organizationId = uuidv4();
        role = 'admin';
      } else {
        // 既存のorganizationIdの場合、管理者が招待したユーザーとして登録
        const q = query(userCollection, where('organizationId', '==', organizationId));
        const userDocs = await getDocs(q);
        if (userDocs.empty) {
          role = 'admin'; // 組織内の最初のユーザーは管理者に設定
        }
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: role,
        organizationId: organizationId
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
    return authState(this.auth);
  }
}