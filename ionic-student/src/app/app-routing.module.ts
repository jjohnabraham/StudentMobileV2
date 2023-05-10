import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { PECErrorComponent } from './shared/components/error/pec-error.component';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./shared/components/tabs/tabs.module').then((m) => m.TabsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'error/:errorType',
    component: PECErrorComponent,
  },
  {
    path: 'error/:errorType/:errorCode',
    component: PECErrorComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: NoPreloading })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
