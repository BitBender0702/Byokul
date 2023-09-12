import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'payment',
    templateUrl: './certificateView.component.html',
    styleUrls: ['./certificateView.component.css']
  })

  export class CertificateViewComponent {
    certificateUrl: any;
    certificateName!:string;
    isSubmitted: boolean = false;
    certificate:any;
    isDataLoaded:boolean = false;
    pdfSrc!: Uint8Array;
    from!:number;

    URL!:string;
    image!:Blob;
    imageURL!:SafeUrl;

    certi:any;
    private _userService;
    response!:any;

    constructor(private bsModalService: BsModalService,userService:UserService,private fb: FormBuilder,public options: ModalOptions,private domSanitizer: DomSanitizer,private h:HttpClient) {
      this._userService = userService;
    }

    ngOnInit(): void {
      debugger
      this.certificate = this.options.initialState;
      this.URL = this.certificate.certificateUrl;
      this.from = this.certificate.from;
      var lastSlashIndex = this.URL.lastIndexOf('/');
      this.certificateName = this.URL.substring(lastSlashIndex +1);

      this._userService.getCertificatePdf(this.certificateName,this.from).subscribe((response:any) => {
        let file = new Blob([response.byteArray], { type: 'application/pdf' });  
        this.pdfSrc = Uint8Array.from(window.atob(response), (c) => c.charCodeAt(0))          
        this.isDataLoaded = true;
        });
    }

    close(): void {
      this.bsModalService.hide(this.bsModalService.config.id);
    }
}
