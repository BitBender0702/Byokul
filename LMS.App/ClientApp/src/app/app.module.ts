
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

import { RootModule } from 'src/root/root.module';
import { AuthGuard } from 'src/root/service/auth.guard';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NavMenuComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component:  AppComponent,

      children: [
        {
          path: '',
           component:NavMenuComponent ,
          
        }]
      }
    ]),
  ],
  providers: [AuthGuard]
})
export class AppModule { }
