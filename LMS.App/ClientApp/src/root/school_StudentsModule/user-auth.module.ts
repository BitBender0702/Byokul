import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LoginComponent } from './schoolStudents-auth/component/login/login.component';
import { ChangePasswordComponent } from './schoolStudents-auth/component/change-password/change-password.component';
import { ForgetPasswordComponent } from './schoolStudents-auth/component/forget-password/forget-password.component';
import { RegisterComponent } from './schoolStudents-auth/component/register/register.component';
import { AuthGuard } from '../service/auth.guard';
import { StudentsAuthGuard } from './services/students-auth.guard';
import { ResetPasswordComponent } from '../root/sharedModule/reset-password.component';
import { UserAuthComponent } from './user-auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient,HttpClientModule } from '@angular/common/http';







@NgModule({
  declarations: [UserAuthComponent, LoginComponent,RegisterComponent, ChangePasswordComponent, ForgetPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,

    HttpClientModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),

    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: UserAuthComponent,
      children: [
        {
          path: '',
          redirectTo: 'login',
          pathMatch: 'full',
        },
        {
          path: 'login',
          component: LoginComponent,
        },
        {
          path: 'register',
          component: RegisterComponent,
        },
        {
          path: 'request-password',
          component: ForgetPasswordComponent,
        },
        {
            path: 'change-password',
            component:ChangePasswordComponent,
            // canActivate:[StudentsAuthGuard]
        },
        {
          path: 'reset-password/:id',
          component:ResetPasswordComponent
      }

  ]}])],
  providers:[]
})
export class UserAuthModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
