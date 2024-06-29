import { Injectable, ComponentRef, ApplicationRef, Injector, createComponent } from '@angular/core';
import { ToastComponent } from '../components/toast/toast.component';

interface ToastItem {
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastQueue: ToastItem[] = [];
  private isDisplaying = false;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
    this.toastQueue.push({ message, type, duration });
    if (!this.isDisplaying) {
      this.displayNext();
    }
  }

  private displayNext() {
    if (this.toastQueue.length === 0) {
      this.isDisplaying = false;
      return;
    }

    this.isDisplaying = true;
    const toastItem = this.toastQueue.shift()!;
    const toastComponentRef = this.createToastComponent(toastItem);

    setTimeout(() => {
      this.removeToastComponent(toastComponentRef);
      this.displayNext();
    }, toastItem.duration + 300); // 300ms はアニメーションの時間
  }

  private createToastComponent(toastItem: ToastItem): ComponentRef<ToastComponent> {
    const toastComponentRef = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    const { message, type, duration } = toastItem;
    Object.assign(toastComponentRef.instance, { message, type, duration });

    this.appRef.attachView(toastComponentRef.hostView);
    document.body.appendChild(toastComponentRef.location.nativeElement);
    toastComponentRef.instance.show();

    return toastComponentRef;
  }

  private removeToastComponent(toastComponentRef: ComponentRef<ToastComponent>) {
    toastComponentRef.instance.hide();
    setTimeout(() => {
      this.appRef.detachView(toastComponentRef.hostView);
      toastComponentRef.destroy();
    }, 300); // アニメーションが完了するのを待つ
  }
}