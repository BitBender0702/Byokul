import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddUserLanguage } from 'src/root/interfaces/user/addUserLanguage';
import { DeleteUserLanguage } from 'src/root/interfaces/user/deleteUserLanguage';
import { EditUserModel } from 'src/root/interfaces/user/editUserModel';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';


@Component({
    selector: 'schoolProfile-root',
    templateUrl: './userProfile.component.html',
    styleUrls: ['./userProfile.component.css']
  })

  export class UserProfileComponent extends MultilingualComponent implements OnInit {

    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    isSubmitted: boolean = false;

    private _userService;
    user:any;

    userLanguage!:AddUserLanguage;
    deleteLanguage!: DeleteUserLanguage;
    filteredLanguages!: any[];
    languages:any;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

    // from here edit user
    editUser:any;
    editUserForm!:FormGroup;
    languageForm!:FormGroup;
    updateUserDetails!:EditUserModel;
    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;

    uploadImage!:any;
    fileToUpload= new FormData();
    translate!: TranslateService;
    
    constructor(injector: Injector,userService: UserService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._userService = userService;
    }
  
    ngOnInit(): void {

      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');
      
      var id = this.route.snapshot.paramMap.get('userId');
      var userId = id ?? '';

      this._userService.getUserById(userId).subscribe((response) => {
        this.user = response;
        this.isDataLoaded = true;
      });

      this._userService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this.userLanguage = {
        userId: '',
        languageIds: []
       };

       this.languageForm = this.fb.group({
        languages:this.fb.control('',[Validators.required]),
      });

       this.deleteLanguage = {
        userId: '',
        languageId: ''
       };

       this.editUserForm = this.fb.group({
        firstName: this.fb.control(''),
        lastName: this.fb.control(''),
        dob: this.fb.control(''),
        gender: this.fb.control(''),
        description: this.fb.control(''),
        contactEmail: this.fb.control('')
        // avatar: this.fb.control('')
      });

    }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.userLanguage.languageIds.push(languageId);
      // this.languageIds.push(languageId);
    }

    filterLanguages(event:any) {
  
      var userLanguages: any[] = this.user.languages;
      var languages: any[] = this.languages;
  
      this.languages = languages.filter(x => !userLanguages.find(y => y.id == x.id));
      
      let filtered: any[] = [];
      let query = event.query;
      for (let i = 0; i < this.languages.length; i++) {
        let language = this.languages[i];
        if (language.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(language);
        }
      }
      this.filteredLanguages = filtered;
    }

    saveUserLanguages(){
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.closeLanguagesModal();
      this.userLanguage.userId = this.user.id;
      this._userService.saveUserLanguages(this.userLanguage).subscribe((response:any) => {
        this.ngOnInit();
  
      });
    }

    deleteUserLanguage(){
      this.deleteLanguage.userId = this.user.id;
      this._userService.deleteUserLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.ngOnInit();
  
      });
  
    }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    followUser(){
      this._userService.saveUserFollower(this.user.id).subscribe((response) => {
        console.log(response);
      });
    }

    getUserDetails(userId:string){
      this._userService.getUserEditDetails(userId).subscribe((response) => {
        this.editUser = response;
        this.initializeEditFormControls();
    })
  }

  initializeEditFormControls(){
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage','');
    
    var dob = this.editUser.dob;
    if(dob!=null){
      dob = dob.substring(0, dob.indexOf('T'));
    }

    this.editUserForm = this.fb.group({
      firstName: this.fb.control(this.editUser.firstName,[Validators.required]),
      lastName: this.fb.control(this.editUser.lastName,[Validators.required]),
      dob: this.fb.control(dob,[Validators.required]),
      gender: this.fb.control(this.editUser.gender,[Validators.required]),
      description: this.fb.control(this.editUser.description),
      contactEmail: this.fb.control(this.editUser.contactEmail,[Validators.required,Validators.pattern(this.EMAIL_PATTERN)])
    });
    this.editUserForm.updateValueAndValidity();
  }

  handleImageInput(event: any) {
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadImage = _event.target?.result; 
        this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]); 
  }

  updateUser(){
    debugger
    this.isSubmitted=true;
    if (!this.editUserForm.valid) {
      return;
    }

    this.closeModal();

    if(!this.uploadImage){
      this.fileToUpload.append('avatar', this.editUser.avatar);

    }

    this.updateUserDetails=this.editUserForm.value;
    this.fileToUpload.append('id', this.user.id);
    this.fileToUpload.append('firstName', this.updateUserDetails.firstName);
    this.fileToUpload.append('lastName', this.updateUserDetails.lastName);
    this.fileToUpload.append('dob', this.updateUserDetails.dob);
    this.fileToUpload.append('gender',this.updateUserDetails.gender.toString());
    this.fileToUpload.append('description',this.updateUserDetails.description);
    this.fileToUpload.append('contactEmail',this.updateUserDetails.contactEmail);

    this._userService.editUser(this.fileToUpload).subscribe((response:any) => {
      this.isSubmitted=true;
      this.fileToUpload = new FormData();
      this.ngOnInit();
    });

  }
  
  private closeModal(): void {
    debugger
    this.closeEditModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    debugger
    this.closeLanguageModal.nativeElement.click();
  }

omit_special_char(event:any)
{   
   var k;  
   k = event.charCode;
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}

removeLanguage(event: any){
  debugger
  const languageIndex = this.userLanguage.languageIds.findIndex((item) => item === event.id);
  if (languageIndex > -1) {
    this.userLanguage.languageIds.splice(languageIndex, 1);
  }
}

resetLanguageModal(){
  this.isSubmitted = false;
  this.languageForm.setValue({
    languages: [],
  });
  // this is unappro
  //this.schoolTeacher.teacherIds = [];
}
}