import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../../../pages/home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'degree',
        loadChildren: () => import('../../../pages/degree/degree.module').then((m) => m.DegreePageModule),
      },
      {
        path: 'financial-aid',
        loadChildren: () =>
          import('../../../pages/financial-aid/financial-aid.module').then((m) => m.FinancialAidPageModule),
      },
      {
        path: 'connect',
        loadChildren: () => import('../../../pages/connect/connect.module').then((m) => m.ConnectPageModule),
      },
      {
        path: 'more',
        loadChildren: () => import('../../../pages/more/more.module').then((m) => m.MorePageModule),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsRoutingModule {}
