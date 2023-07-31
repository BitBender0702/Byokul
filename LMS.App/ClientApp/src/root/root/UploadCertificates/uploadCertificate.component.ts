import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import { DatePipe } from '@angular/common';
import flatpickr from 'flatpickr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/root/service/user.service';
import { AddUserCertificate } from 'src/root/interfaces/user/addUserCertificate';
import { DeleteUserCertificate } from 'src/root/interfaces/user/deleteUserCertificate';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

declare var require: any;
require('videojs-contrib-quality-levels');
require('videojs-hls-quality-selector');

@Component({
  selector: 'uploadCertificate',
  templateUrl: './uploadCertificate.component.html',
  providers: [MessageService]
})

export class UploadCertificateComponent implements OnInit {

  public player!: videojs.Player;

  userCertificateForm!:FormGroup;
  uploadImage!:any;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
  isSubmitted:boolean=true;

  editUser:any;
  fileToUpload= new FormData();
  private _userService;
  countries:any;
  userCertificate!: AddUserCertificate;
  certificateToUpload = new FormData();
  loadingIcon:boolean = false;
  deleteCertificate!: DeleteUserCertificate;
  translate!: TranslateService;
  user:any;
  userCertificateInfo:any;
  @ViewChild('openUserOwnCertificate') openUserOwnCertificate!: ElementRef;
  
  constructor(private datePipe: DatePipe, private fb: FormBuilder, userService: UserService, public messageService:MessageService,private cd: ChangeDetectorRef, private translateService: TranslateService) {
    this._userService = userService;

  }

  ngOnInit(): void {
    var selectedLang = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLang?? '');
  }

  editUserCertificate(userCertificateInfo:any){
    debugger
    var issuedDate = userCertificateInfo.issuedDate.substring(0, userCertificateInfo.issuedDate.indexOf('T'));     
    issuedDate = this.datePipe.transform(issuedDate, 'MM/dd/yyyy');

    flatpickr('#issuedDate',{
      minDate:"1903-12-31",
      maxDate:new Date(),
      dateFormat: "m/d/Y",
      defaultDate: issuedDate
      });
  
      this.userCertificateForm = this.fb.group({
      certificateName: this.fb.control(userCertificateInfo.certificateName, [Validators.required]),
      provider: this.fb.control(userCertificateInfo.provider, [Validators.required]),
      issuedDate: this.fb.control(issuedDate, [Validators.required]),
      description: this.fb.control(userCertificateInfo.description),
      certificateId: this.fb.control(userCertificateInfo.id)
    });

    this.uploadImage = userCertificateInfo.certificateUrl;
  }

  resetCertificateModal() {
    this.isSubmitted = false;
    this.userCertificate.certificates = [];
    this.uploadImage = null;
    this.userCertificateForm = this.fb.group({
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });
    this.certificateToUpload.set('certificateImage','');
    flatpickr('#issuedDate',{
      minDate:"1903-12-31",
      maxDate:new Date(),
      dateFormat: "m/d/Y",
      defaultDate: new Date()
      });
  }

  deleteUserCertificate() {
    this.loadingIcon = true;
    this.deleteCertificate.userId = this.user.id;
    this._userService
      .deleteUserCertificate(this.deleteCertificate)
      .subscribe((response: any) => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('CertificateDeletedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
      });
  }

  openUserOwnCertificateModal(certificateInfo:any){
    debugger
    this.certificateToUpload.set('certificateImage','');
    this.userCertificateInfo = certificateInfo;
    this.openUserOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
  }

  saveUsercertificcate(){
    debugger
    this.isSubmitted = true;
      if (!this.userCertificateForm.valid) {
        return;
      }
  
      if(this.uploadImage == null){
        return;
      }
  
    this.loadingIcon = true;
    var formValue =this.userCertificateForm.value;
  
  //here we will add if id has
  if(formValue.certificateId != ""){
    this.certificateToUpload.append('certificateId', formValue.certificateId);
  }
  
    if(typeof this.uploadImage == "string"){
      this.certificateToUpload.append('certificateUrl', this.uploadImage);
    }
    this.certificateToUpload.append('certificateName', formValue.certificateName);
    this.certificateToUpload.append('provider', formValue.provider);
    this.certificateToUpload.append('issuedDate', formValue.issuedDate);
    this.certificateToUpload.append('description', formValue.description);
    
    this._userService.saveUserCertificates(this.certificateToUpload).subscribe((response:any) => {
      debugger
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.certificateToUpload = new FormData();
      this.userCertificate.certificates = [];
      if(formValue.certificateId != ""){
        var translatedSummary = this.translateService.instant('Success');
        var translatedMessage = this.translateService.instant('CertificateUpdatedSuccessfully');   
      }
      else{
      var translatedSummary = this.translateService.instant('Success');
      var translatedMessage = this.translateService.instant('CertificateAddedSuccessfully');   
     }
      this.messageService.add({
        severity: 'success',
        summary: translatedSummary,
        life: 3000,
        detail: translatedMessage,
      });
      this.ngOnInit();
  });
  
  }
  private closeCertificatesModal(): void {
    this.closeCertificateModal.nativeElement.click();
  }
  
}