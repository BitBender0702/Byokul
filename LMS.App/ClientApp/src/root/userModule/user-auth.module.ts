import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LoginComponent } from './user-auth/component/login/login.component';
import { ChangePasswordComponent } from './user-auth/component/change-password/change-password.component';
import { ForgetPasswordComponent } from './user-auth/component/forget-password/forget-password.component';
import { RegisterComponent } from './user-auth/component/register/register.component';
import { AuthGuard } from '../service/auth.guard';
import { ResetPasswordComponent } from '../root/sharedModule/reset-password.component';
import { UserAuthComponent } from './user-auth.component';
import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../root/sharedModule/shared.module';
import { LogoutComponent } from './user-auth/component/logout/logout.component';
import { ConfirmEmailComponent } from './user-auth/component/confirmEmail/confirmEmail.component';
import { ToastModule } from 'primeng/toast';
import { SetPasswordComponent } from './user-auth/component/set-password/set-password.component';

@NgModule({
  declarations: [UserAuthComponent, LoginComponent,ConfirmEmailComponent,SetPasswordComponent,RegisterComponent, ChangePasswordComponent, ForgetPasswordComponent],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ToastModule,
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
            canActivate: [AuthGuard]
        },
        {
          path: 'reset-password/:id',
          component:ResetPasswordComponent
      },
      {
        path: 'emailConfirm',
        component:ConfirmEmailComponent
     },
    {
      path: 'setPassword',
      component:SetPasswordComponent
    },
      {
        path: 'logout',
        component:LogoutComponent
    },


  ]}])],
  
  providers:[]
})
export class UserAuthModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
