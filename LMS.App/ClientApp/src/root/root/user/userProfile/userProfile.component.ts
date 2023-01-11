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

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CreatePostComponent } from '../../createPost/createPost.component';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent } from '../../postView/postView.component';
import { MessageService } from 'primeng/api';


@Component({
    selector: 'userProfile-root',
    templateUrl: './userProfile.component.html',
    styleUrls: ['./userProfile.component.css'],
    providers: [MessageService]
  })

  export class UserProfileComponent extends MultilingualComponent implements OnInit {

    @BlockUI() blockUi!: NgBlockUI;

    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    isSubmitted: boolean = false;
    isOpenModal:boolean = false;
    loadingIcon:boolean = false;
    blockedDocument: boolean = false;
    isProfileGrid:boolean = true;
    userId!:string;
    isFollowed!:boolean;

    private _userService;
    private _postService;
    user:any;
    validToken!:string;

    userLanguage!:AddUserLanguage;
    deleteLanguage!: DeleteUserLanguage;
    filteredLanguages!: any[];
    languages:any;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    editUser:any;
    editUserForm!:FormGroup;
    languageForm!:FormGroup;
    updateUserDetails!:EditUserModel;
    isOwner!:boolean;
    followUnfollowUser!: FollowUnfollow;
    followersLength!:number;
    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;

    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;


    uploadImage!:any;
    fileToUpload= new FormData();
    translate!: TranslateService;
    
    constructor(injector: Injector,public messageService:MessageService, private bsModalService: BsModalService,userService: UserService,postService: PostService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._userService = userService;
        this._postService = postService;
    }
  
    ngOnInit(): void {
      this.validToken = localStorage.getItem("jwt")?? '';
      this.loadingIcon = true;
      // this.blockUI();
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');
      
      var id = this.route.snapshot.paramMap.get('userId');
      this.userId = id ?? '';

      

      this._userService.getUserById(this.userId).subscribe((response) => {
        debugger
        this.user = response;
        this.followersLength = this.user.followers.length;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        // this.unblockUI();
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
        languages:this.fb.control([],[Validators.required]),
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
      });

      this.InitializeFollowUnfollowUser();

    }

    InitializeFollowUnfollowUser(){
      this.followUnfollowUser = {
        id: '',
        isFollowed: false
       };
    }

    isOwnerOrNot(){
      debugger
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          if(decodedJwtData.sub == this.user.email){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
            this.isFollowedOwnerOrNot(decodedJwtData.jti);
          }

        }
        
    }

    isFollowedOwnerOrNot(userId:string){
      var followers: any[] = this.user.followers;
      var isFollowed = followers.filter(x => x.followerId == userId);
      if(isFollowed.length != 0){
        this.isFollowed = true;
      }
      else{
        this.isFollowed = false;
      }
    //   const isFound = this.user.followers.some(element => {
    //     if (element.followerId === 1) {
    //       this.isFollowed = true;
    //     }
    //     else{
    //     this.isFollowed = false;
    //     }

    // }
  }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.userLanguage.languageIds.push(languageId);
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
      this.loadingIcon = true;
      this.userLanguage.userId = this.user.id;
      this._userService.saveUserLanguages(this.userLanguage).subscribe((response:any) => {
        this.closeLanguagesModal();
        this.isSubmitted = true;
        this.ngOnInit();     
  
      });
    }

    deleteUserLanguage(){
      this.loadingIcon = true;
      this.deleteLanguage.userId = this.user.id;
      this._userService.deleteUserLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.ngOnInit();
      });
    }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    followUser(userId:string,from:string){
      if(this.validToken == ''){
        window.open('user/auth/login', '_blank');
      }
      else{
      this.followUnfollowUser.id = userId;
      if(from == FollowUnFollowEnum.Follow){
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowUser.isFollowed = true;
      }
      else{
        this.followersLength -= 1; 
        this.isFollowed = false;
        this.followUnfollowUser.isFollowed = false;
      }
      this._userService.saveUserFollower(this.followUnfollowUser).subscribe((response) => {
        this.InitializeFollowUnfollowUser();
      });
    }
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
    this.isSubmitted=true;
    if (!this.editUserForm.valid) {
      return;
    }
    this.loadingIcon = true;
    // this.blockUI();

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
      this.closeModal();
      this.isSubmitted=true;
      this.fileToUpload = new FormData();
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Profile updated successfully'});
      this.ngOnInit();
    });

  }
  
  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

omit_special_char(event:any)
{   
   var k;  
   k = event.charCode;
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}

removeLanguage(event: any){
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
}

createPost(){
  this.isOpenModal = true;

}

blockUI() {
  this.blockUi.start("Loading");
}

unblockUI(){
  this.blockUi.stop();
}

profileGrid(){
  this.isProfileGrid = true;

}

profileList(){
  this.isProfileGrid = false;

}

back(): void {
  window.history.back();
}

openPostModal(): void {
  const initialState = {
    userId: this.user.id,
    from: "user"
  };
    this.bsModalService.show(CreatePostComponent,{initialState});
}

pinUnpinPost(attachmentId:string,isPinned:boolean){
  this._postService.pinUnpinPost(attachmentId,isPinned).subscribe((response) => {
    this.ngOnInit();
    console.log(response);
  });

}

openPostsViewModal(posts:string): void {
  const initialState = {
    posts: posts
  };
  this.bsModalService.show(PostViewComponent,{initialState});
}

userChat(){
  if(this.validToken == ''){
    window.open('user/auth/login', '_blank');
  }
  else{
    window.location.href=`user/chat`;
  }   
}

}


