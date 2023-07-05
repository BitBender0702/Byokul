import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { CreateSchoolModel } from 'src/root/interfaces/school/createSchoolModel';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {StepsModule} from 'primeng/steps';
import {MenuItem, MessageService} from 'primeng/api';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { Subject, Subscription } from 'rxjs';
import { environment } from "src/environments/environment";
import { BsModalService } from 'ngx-bootstrap/modal';
import { SharePostComponent } from '../../sharePost/sharePost.component';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';

export const ownedSchoolResponse =new Subject<{schoolId: string, schoolAvatar : string,schoolName:string,action:string}>(); 

@Component({
  selector: 'students-Home',
  templateUrl: './createSchool.component.html',
  styleUrls: ['./createSchool.component.css'],
  providers: [MessageService]
})

export class CreateSchoolComponent extends MultilingualComponent implements OnInit, OnDestroy {

  get apiUrl(): string {
    return environment.apiUrl;
  }

  private _schoolService;
  countries:any;
  specializations:any;
  defaultLogos:any;
  languages:any;
  school!:CreateSchoolModel;
  createSchoolForm!:FormGroup;
  createSchoolForm1!:FormGroup;
  createSchoolForm2!:FormGroup;
  createSchoolForm3!:FormGroup;
  invalidMeetingName!: boolean;
  isSubmitted: boolean = false;
  isStepCompleted: boolean = false;
  uploadImage!:any;
  uploadImageName!:string;
  fileToUpload= new FormData();
  logoUrl!:string;
  items!: MenuItem[];
  step: number = 0;
  isOpenSidebar:boolean = false;
  isOpenModal:boolean = false;
  avatarImage!:any;

  initialSpecialization!:string;
  loadingIcon:boolean = false;
  schoolUrl!:string;
  schoolId!:string;
  schoolName!:string;
  changeLanguageSubscription!: Subscription;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  selectedImage: any = '';
  isSelected: boolean = false;

  separateDialCode = false;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryISO:any;
  
  constructor(injector: Injector,private translateService: TranslateService,private bsModalService: BsModalService,public messageService:MessageService,private domSanitizer: DomSanitizer,private router: Router,private fb: FormBuilder,schoolService: SchoolService,private http: HttpClient) {
    super(injector);
    this._schoolService = schoolService;
  }

  ngOnInit(): void {
    debugger
    this.selectedCountryISO = CountryISO.Turkey;
    this.step = 0;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];

  this._schoolService.getDefaultLogo().subscribe((response) => {
    this.defaultLogos = response;
  });

  this._schoolService.getCountryList().subscribe((response) => {
    this.countries = response;
  });

  this._schoolService.getSpecializationList().subscribe((response) => {
    this.specializations = response;
  });
    
  this._schoolService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });

  this.createSchoolForm1 = this.fb.group({
    schoolName: this.fb.control('', [Validators.required]),
    countryName: this.fb.control('', [Validators.required]),
    specializationId: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    selectedLanguages:this.fb.control('',[Validators.required]),
    phoneNumber: ['', [Validators.required]],
  });

  this.createSchoolForm3 = this.fb.group({
    schoolUrl: this.fb.control('',[Validators.required]),
  });
  this.createSchoolForm2 = this.fb.group({
    defaultAvatar: this.fb.control(''),
  });

  if(!this.changeLanguageSubscription){
    this.changeLanguageSubscription = changeLanguage.subscribe(response => {
      this.translate.use(response.language);
    })
  }
}

ngOnDestroy(): void {
  if(this.changeLanguageSubscription){
    this.changeLanguageSubscription.unsubscribe();
  }
}

  copyMessage(inputElement:any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    const translatedInfoSummary = this.translateService.instant('Success');
    const translatedMessage = this.translateService.instant('CopiedToClipboard');
    this.messageService.add({severity:'success', summary:translatedInfoSummary,life: 3000, detail:translatedMessage});
  }

  handleDefaultImageInput(url:string){
    this.logoUrl = url;
  }

  handleImageInput(event: any) {
    debugger
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadImage = _event.target?.result; 
        this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]); 
    this.avatarImage = this.fileToUpload.get('avatarImage');

  }

  createSchool(){
    this.isSubmitted=true;
    if (!this.createSchoolForm3.valid) {
      return;
    }

    this.loadingIcon = true;
    this.router.navigateByUrl(`profile/school/${this.schoolName.replace(" ","").toLowerCase()}`)
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    debugger
    var phoneNumber = this.createSchoolForm1.get('phoneNumber')?.value;

    this.isStepCompleted = true;
    if (!this.createSchoolForm1.valid) {
      return;
    }

    if(phoneNumber.number.length < 10){
      this.createSchoolForm1.setErrors({ invalidPhoneNumber: true });
      return;
    }

    var schoolName = this.createSchoolForm1.get('schoolName')?.value;

    var isSchoolnameExist;
   

    var form1Value =this.createSchoolForm1.value;
    this.schoolName = form1Value.schoolName.split(' ').join('');
    this._schoolService.isSchoolNameExist(schoolName).subscribe((response) => {
      if(!response){
        this.createSchoolForm1.setErrors({ unauthenticated: true });
        return;
      }
      else{
        this.fileToUpload.append('schoolName', form1Value.schoolName);
    this.fileToUpload.append('description', form1Value.description);
    this.fileToUpload.append('phoneNumber', form1Value.phoneNumber.number)
    // this.fileToUpload.append('countryId',form1Value.countryId);
    this.fileToUpload.append('countryName',form1Value.countryName);
    this.fileToUpload.append('specializationId',form1Value.specializationId); 
    this.fileToUpload.append('languageIds',JSON.stringify(form1Value.selectedLanguages));
    this.schoolUrl = `${this.apiUrl}/profile/school`+ form1Value.schoolName.replace(" ","").toLowerCase();
        this.step += 1;
        this.isStepCompleted = false;
      }
    });
    
    this.createSchoolForm3.patchValue({
      schoolUrl: `${this.apiUrl}/profile/school/` + form1Value.schoolName.split(' ').join('').toLowerCase(),
    });
  }

  forwardStep2() {
    debugger
    this.isStepCompleted = true;
    if(this.logoUrl == undefined && this.avatarImage == undefined){
      return;
    }
    this.loadingIcon = true;
    var form2Value =this.createSchoolForm2.value;
    this.fileToUpload.append('avatar',this.logoUrl);

    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.fileToUpload.append('schoolUrl',JSON.stringify(this.schoolUrl));
    this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
         var schoolId =  response;
         this.schoolId = schoolId;
         this.loadingIcon = false;
         var form1Value =this.createSchoolForm1.value;
         ownedSchoolResponse.next({schoolId:response.schoolId, schoolAvatar:response.avatar, schoolName:response.schoolName,action:"add"});
         this.step += 1;
         this.isStepCompleted = false;
         this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'School created successfully'});
    });

    
  }

  backStep() {
    this.step -= 1;
  }

  openSidebar(){
    OpenSideBar.next({isOpenSideBar:true})
  }

  createPost(){
    this.isOpenModal = false;

  }

  schoolProfile(){
    window.open(`profile/school/${this.schoolName.replace(" ","").toLowerCase()}`, '_blank');
  }

  removeUploadImage(){
    this.uploadImage = null;
    this.fileToUpload.set('avatarImage','');
    this.avatarImage = undefined;

  }

  openSharePostModal(): void {
    debugger
    const initialState = {
      schoolName: this.schoolName
    };
    this.bsModalService.show(SharePostComponent,{initialState});
  }

  

  // phoneFormatter(event : Event) {
  //   debugger
  //   const phoneNumberControl = this.createSchoolForm1.get('phoneNumber');
  //   let phoneNumber = phoneNumberControl?.value;
  
  //   phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters
  
  //   if (phoneNumber.length > 11) {
  //     phoneNumber = phoneNumber.substr(0, 11);
  //   }
  
  //   // Format the phone number
  //   if (phoneNumber.length >= 1) {
  //     phoneNumber = `+${phoneNumber}`;
  //   }
  //   if (phoneNumber.length >= 3) {
  //     phoneNumber = `${phoneNumber.substr(0, 3)} (${phoneNumber.substr(3)}`;
  //   }
  //   if (phoneNumber.length >= 7) {
  //     phoneNumber = `${phoneNumber.substr(0, 7)}) ${phoneNumber.substr(7)}`;
  //   }
  //   if (phoneNumber.length >= 12) {
  //     phoneNumber = `${phoneNumber.substr(0, 12)} ${phoneNumber.substr(12)}`;
  //   }
  
  //   phoneNumberControl?.setValue(phoneNumber);
  
  //   // Remove parentheses and space when backspace is pressed
  //   if (phoneNumber.length > 0 && phoneNumber.length < 3) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s()-]/g, ''));
  //   }
  //   if (phoneNumber.length >= 3 && phoneNumber.length < 7) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s)]/g, ''));
  //   }
  //   if (phoneNumber.length >= 7 && phoneNumber.length < 12) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s]/g, ''));
  //   }
  // }

  imageCropped(event: ImageCroppedEvent) {
    debugger
    this.selectedImage = event.blob;
    this.croppedImage = this.domSanitizer.bypassSecurityTrustResourceUrl(
      event.objectUrl!
    );
  }
  
  imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }
  
  cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }
  
  loadImageFailed() {
    console.log('Load failed');
  }
  
  onFileChange(event: any): void {
    debugger
    this.isSelected = true;
    this.imageChangedEvent = event;
  }

  changeCountryIsoCode(event:any){
    debugger
    var countryName = event.value;
    this.selectedCountryISO = CountryISO[countryName as keyof typeof CountryISO];

  }
  
  
  
}
