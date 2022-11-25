import { NgModule } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { MultilingualComponent } from './Multilingual/multilingual.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
      MultilingualComponent,
      LoadingSpinnerComponent
    ],
    imports: [
      CommonModule,
        TranslateModule.forRoot({
            loader:{
              provide:TranslateLoader,
              useFactory:HttpLoaderFactory,
              deps:[HttpClient]
            }
          })
    ],
    exports:[MultilingualComponent,LoadingSpinnerComponent],
    providers: [TranslateService]
  })

  export class SharedModule {}

  export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
