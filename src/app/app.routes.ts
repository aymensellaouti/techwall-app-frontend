import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CoursesComponent } from './features/courses/courses.component';
import { RecentComponent } from './features/recent/recent.component';
import { AboutComponent } from './features/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'recent', component: RecentComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
