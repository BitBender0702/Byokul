import { NgModule } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { MultilingualComponent } from './Multilingual/multilingual.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { PostLoadingSpinnerComponent } from './post-loading-spinner/post-loading-spinner.component';
import { ReelsLoadingSpinnerComponent } from './reels-loading-spinner/reels-loading-spinner.component';
import { AdminSideBarComponent } from 'src/root/admin/admin-template/side-bar/adminSide-bar.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
      MultilingualComponent,
      LoadingSpinnerComponent,
      PostLoadingSpinnerComponent,
      ReelsLoadingSpinnerComponent,
      AdminSideBarComponent
    ],
    imports: [
      RouterModule,
      CommonModule,
        TranslateModule.forRoot({
            loader:{
              provide:TranslateLoader,
              useFactory:HttpLoaderFactory,
              deps:[HttpClient]
            }
          })
    ],
    exports:[MultilingualComponent,LoadingSpinnerComponent,PostLoadingSpinnerComponent,ReelsLoadingSpinnerComponent,AdminSideBarComponent],
    providers: [TranslateService]
  })

  export class SharedModule {}

  export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
