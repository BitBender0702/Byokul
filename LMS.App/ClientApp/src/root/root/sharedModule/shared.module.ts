import { NgModule } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { MultilingualComponent } from './Multilingual/multilingual.component';

@NgModule({
    declarations: [
      MultilingualComponent
    ],
    imports: [
        TranslateModule.forRoot({
            loader:{
              provide:TranslateLoader,
              useFactory:HttpLoaderFactory,
              deps:[HttpClient]
            }
          })
    ],
    exports:[MultilingualComponent],
    providers: [TranslateService]
  })

  export class SharedModule {}

  export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
