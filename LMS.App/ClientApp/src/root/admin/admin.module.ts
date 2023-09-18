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
import { AuthGuard } from '../service/auth.guard';
import { InputTextModule } from 'primeng/inputtext';
import { SideBarComponent } from '../user-template/side-bar/side-bar.component';
import { SchoolTransactionsComponent } from './SchoolTransactions/schoolTransactions.component';
import { ClassCourseModalComponent } from '../root/ClassCourseModal/classCourseModal.component';
import { ClassCourseTransactionsComponent } from './ClassCourseTransactions/classCourseTransactions.component';
import { ToastModule } from 'primeng/toast';
// import { ChangePasswordForAdminComponent } from './change-password-for-admin/change-password-for-admin.component';

const routes: Routes = [
  {
    path: '',
    redirectTo:'adminHome',
    component: AdminHomeComponent, canActivate: [AuthGuard]
  },

  {
    path: 'adminHome',
    component: AdminHomeComponent, canActivate: [AuthGuard]
  },
  {
    path: 'registeredUsers',
    component: RegisteredUsersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'registeredSchools',
    component: RegisteredSchoolsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'registeredClasses',
    component: RegisteredClassesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'registeredCourses',
    component: RegisteredCoursesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'schoolTransactions',
    component: SchoolTransactionsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'classCourseTransactions',
    component: ClassCourseTransactionsComponent, canActivate: [AuthGuard]
  }

];


@NgModule({
  declarations: [
    AdminHomeComponent,
    RegisteredUsersComponent,
    RegisteredSchoolsComponent,
    RegisteredClassesComponent,
    RegisteredCoursesComponent,
    SchoolTransactionsComponent,
    ClassCourseTransactionsComponent,
    // ChangePasswordForAdminComponent
    
  ],
  imports: [
    SharedModule,
    CommonModule,
    ToastModule,
    [RouterModule.forChild(routes)],
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
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
