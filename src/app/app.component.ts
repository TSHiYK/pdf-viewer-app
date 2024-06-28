import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="spectrum-App">
      <header class="spectrum-AppHeader">
        <h1 class="spectrum-Heading spectrum-Heading--sizeXXL">PDF Viewer App</h1>
      </header>
      <main class="spectrum-App-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }