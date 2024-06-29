import { Component, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" [ngClass]="type">
      {{ message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-60px);
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      max-width: 350px;
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      text-align: center;
      opacity: 0;
      transition: transform 300ms ease-out, opacity 300ms ease-out;
    }
    .success { background-color: #4caf50; }
    .error { background-color: #f44336; }
    .info { background-color: #2196f3; }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';
  @Input() duration: number = 3000;

  private timer: any;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.show();
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  show() {
    // 表示アニメーション
    setTimeout(() => {
      this.renderer.setStyle(this.el.nativeElement.firstChild, 'opacity', '1');
      this.renderer.setStyle(this.el.nativeElement.firstChild, 'transform', 'translateX(-50%) translateY(0)');
    }, 50);

    // 消失タイマーのセット
    this.timer = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  hide() {
    // 消失アニメーション
    this.renderer.setStyle(this.el.nativeElement.firstChild, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement.firstChild, 'transform', 'translateX(-50%) translateY(-60px)');

    // コンポーネントの削除
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.el.nativeElement);
    }, 300);
  }
}