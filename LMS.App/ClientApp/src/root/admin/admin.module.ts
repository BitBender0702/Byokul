import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SharedModule } from '../root/sharedModule/shared.module';
import { AdminHomeComponent } from './adminHome/adminHome.component';
import { AdminSideBarComponent } from './admin-template/side-bar/adminSide-bar.component';
import { RegisteredUsersComponent } from './registeredUsers/registeredUsers.component';

import {TableModule} from 'primeng/table';
import { RegisteredSchoolsComponent } from './registeredSchools/registeredSchools.component';
import { RegisteredClassesComponent } from './registeredClasses/registeredClasses.component';
import { RegisteredCoursesComponent } from './registeredCourses/registeredCourses.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

const routes: Routes = [
  {
    path: '',
    redirectTo:'adminHome',
    component: AdminHomeComponent
  },

  {
    path: 'adminHome',
    component: AdminHomeComponent
  },
  {
    path: 'registeredUsers',
    component: RegisteredUsersComponent
  },
  {
    path: 'registeredSchools',
    component: RegisteredSchoolsComponent
  },
  {
    path: 'registeredClasses',
    component: RegisteredClassesComponent
  },
  {
    path: 'registeredCourses',
    component: RegisteredCoursesComponent
  }
];


@NgModule({
  declarations: [
    AdminHomeComponent,
    AdminSideBarComponent,
    RegisteredUsersComponent,
    RegisteredSchoolsComponent,
    RegisteredClassesComponent,
    RegisteredCoursesComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    [RouterModule.forChild(routes)],
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
  ],
  providers: [],
  exports:[RouterModule]
})
export class AdminModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
