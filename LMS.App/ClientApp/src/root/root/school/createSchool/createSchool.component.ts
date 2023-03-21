import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CreateSchoolModel } from 'src/root/interfaces/school/createSchoolModel';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {StepsModule} from 'primeng/steps';
import {MenuItem, MessageService} from 'primeng/api';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { Subject } from 'rxjs';

export const ownedSchoolResponse =new Subject<{schoolId: string, schoolAvatar : string,schoolName:string,action:string}>(); 

@Component({
  selector: 'students-Home',
  templateUrl: './createSchool.component.html',
  styleUrls: ['./createSchool.component.css'],
  providers: [MessageService]
})

export class CreateSchoolComponent extends MultilingualComponent implements OnInit {
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

  
  constructor(injector: Injector,public messageService:MessageService,private domSanitizer: DomSanitizer,private router: Router,private fb: FormBuilder,schoolService: SchoolService,private http: HttpClient) {
    super(injector);
    this._schoolService = schoolService;
  }

  ngOnInit(): void {
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
    countryId: this.fb.control('', [Validators.required]),
    specializationId: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    selectedLanguages:this.fb.control('',[Validators.required])
  });

  this.createSchoolForm3 = this.fb.group({
    schoolUrl: this.fb.control('',[Validators.required]),
  });
  this.createSchoolForm2 = this.fb.group({
    defaultAvatar: this.fb.control(''),
  });
}

  copyMessage(inputElement:any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  handleDefaultImageInput(url:string){
    this.logoUrl = url;
  }

  handleImageInput(event: any) {
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
    
    this.isStepCompleted = true;
    if (!this.createSchoolForm1.valid) {
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
    this.fileToUpload.append('countryId',form1Value.countryId);
    this.fileToUpload.append('specializationId',form1Value.specializationId); 
    this.fileToUpload.append('languageIds',JSON.stringify(form1Value.selectedLanguages));
    this.schoolUrl = 'byokul.com/profile/school/' + form1Value.schoolName.replace(" ","").toLowerCase();
    
        this.step += 1;
        this.isStepCompleted = false;
      }
    });

    // this.fileToUpload.append('schoolName', form1Value.schoolName);
    // this.fileToUpload.append('description', form1Value.description);
    // this.fileToUpload.append('countryId',form1Value.countryId);
    // this.fileToUpload.append('specializationId',form1Value.specializationId); 
    // this.fileToUpload.append('languageIds',JSON.stringify(form1Value.selectedLanguages));
    // this.schoolUrl = 'byokul.com/profile/school/' + form1Value.schoolName.replace(" ","");
    // this.schoolName = form1Value.schoolName.split(' ').join('');
    // this._schoolService.isSchoolNameExist(schoolName).subscribe((response) => {
    //   if(!response){
    //     this.createSchoolForm1.setErrors({ unauthenticated: true });
    //     return;
    //   }
    //   else{
    //     this.step += 1;
    //     this.isStepCompleted = false;
    //   }
    // });
    

    this.createSchoolForm3.patchValue({
      schoolUrl: 'byokul.com/profile/school/' + form1Value.schoolName.split(' ').join('').toLowerCase(),
    });
  }

  forwardStep2() {
    this.loadingIcon = true;
    this.isStepCompleted = true;
    if(this.logoUrl == undefined && this.avatarImage == undefined){
      return;
    }
    var form2Value =this.createSchoolForm2.value;
    this.fileToUpload.append('avatar',this.logoUrl);

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
    this.isOpenSidebar = true;
  }

  createPost(){
    this.isOpenModal = false;

  }

  schoolProfile(){
    window.open(`profile/school/${this.schoolName.replace(" ","").toLowerCase()}`, '_blank');
  }
  
}
