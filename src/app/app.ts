import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssistantWidgetComponent } from './layout/assistant-widget/assistant-widget.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AssistantWidgetComponent],
  template: `
    <router-outlet></router-outlet>
    <app-assistant-widget></app-assistant-widget>
  `,
  styles: []
})
export class App {}
