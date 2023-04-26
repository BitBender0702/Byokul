import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, Subscription } from 'rxjs';
import { EditSchoolModel } from 'src/root/interfaces/school/editSchoolModel';
import { AddSchoolLanguage } from 'src/root/interfaces/school/addSchoolLanguage';
import { SchoolService } from 'src/root/service/school.service';
import { DeleteSchoolLanguage } from 'src/root/interfaces/school/deleteSchoolLanguage';
import { AddSchoolTeacher } from 'src/root/interfaces/school/addSchoolTeacher';
import { DeleteSchoolTeacher } from 'src/root/interfaces/school/deleteSchoolTeacher';
import { AddSchoolCertificate } from 'src/root/interfaces/school/addSchoolCertificate';
import { DeleteSchoolCertificate } from 'src/root/interfaces/school/deleteSchoolCertificate';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import {
  addPostResponse,
  CreatePostComponent,
} from '../../createPost/createPost.component';

import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent, savedPostResponse } from '../../postView/postView.component';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { LikeUnlikeClassCourse } from 'src/root/interfaces/school/likeUnlikeClassCourse';
import { MessageService } from 'primeng/api';
import { ReelsViewComponent, savedReelResponse } from '../../reels/reelsView.component';
import { ownedSchoolResponse } from '../createSchool/createSchool.component';
import * as $ from 'jquery';
import { ClassCourseModalComponent, savedClassCourseResponse } from '../../ClassCourseModal/classCourseModal.component';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { CourseService } from 'src/root/service/course.service';
import { ClassService } from 'src/root/service/class.service';
import { ClassCourseFilterTypeEnum } from 'src/root/Enums/classCourseFilterTypeEnum';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { PermissionTypeEnum } from 'src/root/Enums/permissionTypeEnum';
import { SharePostComponent, sharedPostResponse } from '../../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { AuthService } from 'src/root/service/auth.service';


@Component({
  selector: 'schoolProfile-root',
  templateUrl: './schoolProfile.component.html',
  styleUrls: ['./schoolProfile.component.css'],
  providers: [MessageService],
})
export class SchoolProfileComponent
  extends MultilingualComponent
  implements OnInit, OnDestroy, OnChanges
{
  private _schoolService;
  private _postService;
  private _notificationService;
  private _classService;
  private _courseService;
  private _authService;
  school: any;
  isProfileGrid: boolean = true;
  isOpenSidebar: boolean = false;
  hideFeedFilters: boolean = true;
  loadingIcon: boolean = false;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon:boolean = false;
  isOpenModal: boolean = false;
  schoolId!: string;
  isDataLoaded: boolean = false;
  isSchoolFollowed: boolean = false;
  validToken!: string;
  editSchool: any;
  editSchoolForm!: FormGroup;
  accessibility: any;
  isSubmitted: boolean = false;
  fileToUpload = new FormData();
  certificateToUpload = new FormData();
  uploadImage!: any;
  updateSchoolDetails!: EditSchoolModel;
  languageForm!: FormGroup;
  teacherForm!: FormGroup;
  certificateForm!: FormGroup;
  languageIds: string[] = [];
  schoolLanguage!: AddSchoolLanguage;
  schoolTeacher!: AddSchoolTeacher;
  schoolCertificate!: AddSchoolCertificate;
  filteredLanguages!: any[];
  languages: any;
  deleteLanguage!: DeleteSchoolLanguage;
  deleteTeacher!: DeleteSchoolTeacher;
  deleteCertificate!: DeleteSchoolCertificate;
  EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  selectedCertificates: any;
  isOwner!: boolean;
  teacherInfo: any[] = [];
  teachers: any;
  filteredTeachers!: any[];
  followUnfollowSchool!: FollowUnfollow;
  isFollowed!: boolean;
  followersLength!: number;
  classCourseList: any;
  likesLength!: number;
  isLiked!: boolean;
  likeUnlikePost!: LikeUnlikePost;
  likeUnlikeClassCourses!: LikeUnlikeClassCourse;
  userId!: string;
  currentLikedPostId!: string;
  currentLikedClassCourseId!: string;
  schoolName!: string;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  postView!: PostView;
  likesClassCourseLength!: number;
  isClassCourseLiked!: boolean;
  itemsPerSlide = 7;
  singleSlideOffset = true;
  noWrap = true;
  isFeedHide: boolean = false;
  frontEndPageNumber: number = 1;
  scrollFeedResponseCount:number = 1;
  classCoursePageNumber: number = 1;
  scrollClassCourseResponseCount:number = 1;
  classCourseItem:any;
  classFilters:any;
  courseFilters:any;
  noOfAppliedClassFilters!:number;
  noOfAppliedCourseFilters!:number;
  classFilterList:any[] = [];
  courseFilterList:any[] = [];
  isOnInitInitialize:boolean = false;
  

  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
  @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('createPostModal', { static: true })
  createPostModal!: CreatePostComponent;
  Certificates!: string[];
  schoolParamsData$: any;
  reelsPageNumber:number = 1;
  scrolled:boolean = false;
  userPermissions:any;
  hasAllPermission:any;
  hasPostPermission!:boolean;
  hasUpdateSchoolPermission!:boolean;
  hasCreateEditClassPermission!:boolean;
  hasCreateEditCoursePermission!:boolean;
  hasManageTeachersPermission!:boolean;
  hasAddSchoolCertificatesPermission!:boolean;
  hasAddLanguagesPermission!:boolean;
  videoElements:any;
  savedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  addPostSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  savedClassCourseSubscription!: Subscription;
  savedMessage!:string;
  removedMessage!:string;

  constructor(
    injector: Injector,
    public messageService: MessageService,
    postService: PostService,
    private bsModalService: BsModalService,
    private matDialog: MatDialog,
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    schoolService: SchoolService,
    authService:AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    notificationService:NotificationService,
    classService:ClassService,
    courseService:CourseService,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
    this._schoolService = schoolService;
    this._postService = postService;
    this._notificationService = notificationService;
    this._classService = classService,
    this._courseService = courseService
    this._authService = authService;
    this.schoolParamsData$ = this.route.params.subscribe((routeParams) => {
      this.schoolName = routeParams.schoolName;
      if (!this.loadingIcon && this.isOnInitInitialize){
        this.ngOnInit();
      }
    });
  }
  ngOnDestroy(): void {
    if(this.savedPostSubscription){
      this.savedPostSubscription.unsubscribe();
    }
    if(this.savedReelSubscription){
      this.savedReelSubscription.unsubscribe();
    }
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
    if(this.sharedPostSubscription){
      this.sharedPostSubscription.unsubscribe();
    }
    if(this.savedClassCourseSubscription){
      this.savedClassCourseSubscription.unsubscribe();
    }
    if (this.schoolParamsData$) {
        this.schoolParamsData$.unsubscribe();
    }
  }
  ngOnChanges(): void {
    
  }
  ngOnInit(): void {
   this.isOnInitInitialize = true;
   this.postLoadingIcon = false;
   this._authService.loginState$.next(true);
    this.loadingIcon = true;
    this.validToken = localStorage.getItem('jwt') ?? '';
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.translate.use(selectedLang ?? '');

    

    this._schoolService.getSchoolById(this.schoolName.replace(' ', '').toLowerCase()).subscribe(async (response) => {
      debugger
        this.frontEndPageNumber = 1;
        this.reelsPageNumber = 1;
        this.school = response;
        this.followersLength = this.school.schoolFollowers.length;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        this.postLoadingIcon = false;
        this.scrolled = false;
        this.isDataLoaded = true;
        this.cd.detectChanges(); 
        this.noOfAppliedClassFilters = this.school.noOfAppliedClassFilters;
        this.noOfAppliedCourseFilters = this.school.noOfAppliedCourseFilters;
        this.addEventListnerOnCarousel();
      });

    this._schoolService.getAccessibility().subscribe((response) => {
      this.accessibility = response;
    });

    this._schoolService.getLanguageList().subscribe((response) => {
      this.languages = response;
    });

    this._schoolService.getAllTeachers().subscribe((response) => {
      this.teachers = response;
    });

    this.editSchoolForm = this.fb.group({
      schoolName: this.fb.control(''),
      schoolSlogan: this.fb.control(''),
      founded: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      schoolEmail: this.fb.control(''),
      description: this.fb.control(''),
      owner: this.fb.control(''),
    });

    this.languageForm = this.fb.group({
      languages: this.fb.control([], [Validators.required]),
    });

    this.teacherForm = this.fb.group({
      teachers: this.fb.control([], [Validators.required]),
    });

    this.certificateForm = this.fb.group({
      certificates: this.fb.control([], [Validators.required]),
    });

    this.schoolLanguage = {
      schoolId: '',
      languageIds: [],
    };

    this.deleteLanguage = {
      schoolId: '',
      languageId: '',
    };

    this.schoolTeacher = {
      schoolId: '',
      teacherIds: [],
    };

    this.deleteTeacher = {
      schoolId: '',
      teacherId: '',
    };

    this.schoolCertificate = {
      schoolId: '',
      certificates: [],
    };

    this.deleteCertificate = {
      schoolId: '',
      certificateId: '',
    };

    this.InitializeLikeUnlikePost();

    this.followUnfollowSchool = {
      id: '',
      isFollowed: false,
    };

    if(!this.addPostSubscription){
      this.addPostSubscription = addPostResponse.subscribe((response) => {
        this.loadingIcon = true;
        this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Post created successfully',});
        this._schoolService.getSchoolById(this.schoolName.replace(' ', '').toLowerCase()).subscribe((response) => {
           this.school = response;
           this.loadingIcon = false;
           this.postLoadingIcon = false;
           this.scrolled = false;
           this.followersLength = this.school.schoolFollowers.length;
           this.isOwnerOrNot();
           this.loadingIcon = false;
           this.isDataLoaded = true;
        });
     });
    }

    if(!this.savedPostSubscription){
      this.savedPostSubscription = savedPostResponse.subscribe(response => {
        if(response.isPostSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post saved successfully'});
        }
        if(!response.isPostSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
        }
      });
    }

    if(!this.savedReelSubscription){
      this.savedReelSubscription = savedReelResponse.subscribe(response => {
        if(response.isReelSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel saved successfully'});
        }
        if(!response.isReelSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel removed successfully'});
        }
      });
    }

   this.sharedPostSubscription = sharedPostResponse.subscribe( response => {
    if(response.postType == 1){
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'{}Post shared successfully'});
      var post = this.school.posts.find((x: { id: string; }) => x.id == response.postId);  
      post.postSharedCount++;
    }
    else
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel shared successfully'});
    });

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    if(!this.savedClassCourseSubscription){
      this.savedClassCourseSubscription = savedClassCourseResponse.subscribe(response => {
        if(response.isSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:`${response.type} saved successfully`});
        }
        if(!response.isSaved){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:`${response.type} removed successfully`});
        }
      });
    }
   
  }

  async convertBlobUrlToStream(blobUrl: string): Promise<any> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    var stream = blob.stream();
    const imageUrl = URL.createObjectURL(blob);
    return blob.stream();
  }

  addEventListnerOnCarousel(){
    if(this.carousel!=undefined){
      if($('carousel')[0].querySelectorAll('a.carousel-control-next')[0])
      {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          this.reelsPageNumber++;
          if(this.reelsPageNumber == 2){
            this.reelsLoadingIcon = true;
          }
          this._schoolService.getReelsBySchoolId(this.school.schoolId, this.reelsPageNumber).subscribe((response) => {
             this.school.reels = [...this.school.reels, ...response];
             this.reelsLoadingIcon = false;
        });
        })
      }  
  }
  }
  InitializeLikeUnlikePost() {
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike: false,
      commentId: '',
    };
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

  if (scrollPosition >= bodyHeight - windowSize) {
    if(this.isFeedHide){
      if(!this.scrolled && this.scrollClassCourseResponseCount != 0){
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.classCoursePageNumber++;
        this.GetSchoolClassCourses();
        }
    }
    if(!this.scrolled && this.scrollFeedResponseCount != 0){
    this.scrolled = true;
    this.postLoadingIcon = true;
    this.frontEndPageNumber++;
    this.getPostsBySchoolId();
    }
  }
  }

  getPostsBySchoolId() {
    if(this.school?.schoolId == undefined){
      this.postLoadingIcon = true;
      return;
    }
    this._schoolService.getPostsBySchoolId(this.school.schoolId, this.frontEndPageNumber).subscribe((response) => {
        this.school.posts = [...this.school.posts, ...response];
        this.postLoadingIcon = false;
        this.scrollFeedResponseCount = response.length;
        this.scrolled = false;
      });
  }

  GetSchoolClassCourses() {
    if(this.school?.schoolId == undefined){
      this.postLoadingIcon = true;
      return;
    }
      this._schoolService.getSchoolClassCourseList(this.school.schoolId,this.classCoursePageNumber).subscribe((result) => {
        if(this.classCourseList != undefined){
        this.classCourseList = [...this.classCourseList, ...result];
        }
        this.postLoadingIcon = false;
        this.scrollClassCourseResponseCount = result.length;
        this.scrolled = false;
      });
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
      if (decodedJwtData.sub == this.school.createdBy) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
        this.isFollowedOwnerOrNot(decodedJwtData.jti);
      }
    }

    this.userPermissions  = JSON.parse(localStorage.getItem('userPermissions')??'');
    var userPermissions: any[] = this.userPermissions;

    userPermissions.forEach(element => {
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.Post){
        this.hasPostPermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.UpdateSchool){
        this.hasUpdateSchoolPermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.CreateEditClass){
        this.hasCreateEditClassPermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.CreateEditCourse){
        this.hasCreateEditCoursePermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.ManageTeachers){
        this.hasManageTeachersPermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.AddSchoolCertificates){
        this.hasAddSchoolCertificatesPermission = true;
        }
        if((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.AddLanguages){
        this.hasAddLanguagesPermission = true;
      }
    });
  }

  isFollowedOwnerOrNot(userId: string) {
    var followers: any[] = this.school.schoolFollowers;
    var isFollowed = followers.filter((x) => x.userId == userId);
    if (isFollowed.length != 0) {
      this.isFollowed = true;
    } else {
      this.isFollowed = false;
    }
  }

  followSchool(schoolId: string, from: string) {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    } else {
      this.followUnfollowSchool.id = schoolId;
      if (from == FollowUnFollowEnum.Follow) {
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowSchool.isFollowed = true;
      } else {
        this.followersLength -= 1;
        this.isFollowed = false;
        this.followUnfollowSchool.isFollowed = false;
      }
      this._schoolService
        .saveSchoolFollower(this.followUnfollowSchool)
        .subscribe((response) => {
          console.log(response);
          if (response.result == 'success') {
            this.isSchoolFollowed = true;
          }
        });
    }
  }

  back(): void {
    window.history.back();
  }

  profileGrid() {
    this.isProfileGrid = true;
  }

  profileList() {
    this.isProfileGrid = false;
    this.isGridItemInfo = true;
    this.cd.detectChanges();
    if(this.videoPlayer != undefined){
      videojs(this.videoPlayer.nativeElement, {autoplay: false});
    }
  }

  openSidebar() {
    this.isOpenSidebar = true;
  }

  getSchoolDetails(schoolId: string) {
    this._schoolService.getSchoolEditDetails(schoolId).subscribe((response) => {
      this.editSchool = response;
      this.initializeEditFormControls();
    });
  }

  initializeEditFormControls() {
    this.uploadImage = '';
    this.imageFile.nativeElement.value = '';
    this.fileToUpload.set('avatarImage', '');
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var currentDate = yyyy + '-' + mm + '-' + dd;

    var founded = this.editSchool.founded;
    if (founded != null) {
      founded = founded.substring(0, founded.indexOf('T'));
    }

    this.editSchoolForm = this.fb.group(
      {
        schoolName: this.fb.control(this.editSchool.schoolName, [
          Validators.required,
        ]),
        schoolSlogan: this.fb.control(this.editSchool.schoolSlogan ?? ''),
        founded: this.fb.control(founded, [Validators.required]),
        accessibilityId: this.fb.control(this.editSchool.accessibilityId, [
          Validators.required,
        ]),
        schoolEmail: this.fb.control(this.editSchool.schoolEmail ?? '', [
          Validators.pattern(this.EMAIL_PATTERN),
        ]),
        description: this.fb.control(this.editSchool.description ?? ''),
        owner: this.fb.control(this.editSchool.user.email),
      },
      { validator: this.dateLessThan('founded', currentDate) }
    );
    this.editSchoolForm.updateValueAndValidity();
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = to;
      if (f.value > t) {
        return {
          dates: `Founded date should be less than Current date`,
        };
      }
      return {};
    };
  }

  resetImage() {}
  updateSchool() {
    this.isSubmitted = true;
    if (!this.editSchoolForm.valid) {
      return;
    }

    this.loadingIcon = true;
    if (!this.uploadImage) {
      this.fileToUpload.append('avatar', this.editSchool.avatar);
    }

    this.updateSchoolDetails = this.editSchoolForm.value;
    this.fileToUpload.append('schoolId', this.school.schoolId);
    this.fileToUpload.append('schoolName', this.updateSchoolDetails.schoolName);
    this.fileToUpload.append(
      'schoolSlogan',
      this.updateSchoolDetails.schoolSlogan
    );
    this.fileToUpload.append('founded', this.updateSchoolDetails.founded);
    this.fileToUpload.append(
      'accessibilityId',
      this.updateSchoolDetails.accessibilityId
    );
    this.fileToUpload.append(
      'schoolEmail',
      this.updateSchoolDetails.schoolEmail
    );
    this.fileToUpload.append(
      'description',
      this.updateSchoolDetails.description
    );

    this._schoolService
      .editSchool(this.fileToUpload)
      .subscribe((response: any) => {
        debugger
        this.closeModal();
        this.isSubmitted = false;
        this.schoolName = this.updateSchoolDetails.schoolName;
        ownedSchoolResponse.next({
          schoolId: response.schoolId,
          schoolAvatar: response.avatar,
          schoolName: response.schoolName,
          action: 'update',
        });
        this.fileToUpload = new FormData();
        this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'School updated successfully',});
        this.ngOnInit();
      });
  }

  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeCertificatesModal(): void {
    this.closeCertificateModal.nativeElement.click();
  }

  private closeTeachersModal(): void {
    this.closeTeacherModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

  handleImageInput(event: any) {
    this.fileToUpload.append(
      'avatarImage',
      event.target.files[0],
      event.target.files[0].name
    );
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.uploadImage = _event.target?.result;
      this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(
        this.uploadImage
      );
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  handleCertificates(event: any) {
    this.schoolCertificate.certificates.push(event.target.files[0]);
  }

  filterLanguages(event: any) {
    var schoolLanguages: any[] = this.school.languages;
    var languages: any[] = this.languages;

    this.languages = languages.filter(
      (x) => !schoolLanguages.find((y) => y.id == x.id)
    );

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

  captureLanguageId(event: any) {
    var languageId = event.id;
    this.schoolLanguage.languageIds.push(languageId);
  }

  saveSchoolLanguages() {
    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.schoolLanguage.schoolId = this.school.schoolId;
    this._schoolService
      .saveSchoolLanguages(this.schoolLanguage)
      .subscribe((response: any) => {
        this.closeLanguagesModal();
        this.isSubmitted = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Language added successfully',
        });
        this.ngOnInit();
      });
  }

  getDeletedLanguage(deletedLanguage: string) {
    this.deleteLanguage.languageId = deletedLanguage;
  }

  deleteSchoolLanguage() {
    this.loadingIcon = true;
    this.deleteLanguage.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolLanguage(this.deleteLanguage)
      .subscribe((response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Language deleted successfully',
        });
        this.ngOnInit();
      });
  }

  filterTeachers(event: any) {
    var schoolTeachers: any[] = this.school.teachers;
    var teachers: any[] = this.teachers;

    this.teachers = teachers.filter(
      (x) => !schoolTeachers.find((y) => y.teacherId == x.teacherId)
    );

    let filteredTeachers: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.teachers.length; i++) {
      let teacher = this.teachers[i];
      if (teacher.firstName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filteredTeachers.push(teacher);
      }
    }
    this.filteredTeachers = filteredTeachers;
  }

  captureTeacherId(event: any) {
    var teacherId = event.teacherId;
    this.schoolTeacher.teacherIds.push(teacherId);
    this.teacherInfo.push(event);
  }

  saveSchoolTeachers() {
    this.isSubmitted = true;
    if (!this.teacherForm.valid) {
      return;
    }

    this.loadingIcon = true;
    this.schoolTeacher.schoolId = this.school.schoolId;
    this._schoolService
      .saveSchoolTeachers(this.schoolTeacher)
      .subscribe((response: any) => {
        this.teachers = [];
        this.closeTeachersModal();
        this.isSubmitted = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Teacher added successfully',
        });
        this.ngOnInit();
      });
  }

  getDeletedTeacher(deletedTeacher: string) {
    this.deleteTeacher.teacherId = deletedTeacher;
  }

  deleteSchoolTeacher() {
    this.loadingIcon = true;
    this.deleteTeacher.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolTeacher(this.deleteTeacher)
      .subscribe((response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Teacher deleted successfully',
        });
        this.ngOnInit();
      });
  }

  saveSchoolCertificates() {
    this.isSubmitted = true;
    if (!this.certificateForm.valid) {
      return;
    }
    this.loadingIcon = true;
    for (var i = 0; i < this.schoolCertificate.certificates.length; i++) {
      this.certificateToUpload.append(
        'certificates',
        this.schoolCertificate.certificates[i]
      );
    }
    this.certificateToUpload.append('schoolId', this.school.schoolId);
    this._schoolService
      .saveSchoolCertificates(this.certificateToUpload)
      .subscribe((response: any) => {
        this.closeCertificatesModal();
        this.isSubmitted = false;
        this.schoolCertificate.certificates = [];
        this.certificateToUpload.set('certificates', '');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Certificate added successfully',
        });
        this.ngOnInit();
        console.log(response);
      });
  }

  getDeletedCertificate(deletedCertificate: string) {
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  deleteSchoolCertificate() {
    this.loadingIcon = true;
    this.deleteCertificate.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolCertificate(this.deleteCertificate)
      .subscribe((response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Certificate deleted successfully',
        });
        this.ngOnInit();
      });
  }

  resetCertificateModal() {
    this.isSubmitted = false;
    this.schoolCertificate.certificates = [];
  }

  resetLanguageModal() {
    this.isSubmitted = false;
    this.languageForm.setValue({
      languages: [],
    });
  }

  resetTeacherModal() {
    this.isSubmitted = false;
    this.teacherForm.setValue({
      teachers: [],
    });
  }

  removeTeacher(event: any) {
    const teacherIndex = this.schoolTeacher.teacherIds.findIndex(
      (item) => item === event.teacherId
    );
    if (teacherIndex > -1) {
      this.schoolTeacher.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeLanguage(event: any) {
    const languageIndex = this.schoolLanguage.languageIds.findIndex(
      (item) => item === event.id
    );
    if (languageIndex > -1) {
      this.schoolLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  createPost() {
    this.isOpenModal = true;
  }

  openPostModal(): void {
    const initialState = {
      schoolId: this.school.schoolId,
      from: 'school',
    };
    this.bsModalService.show(CreatePostComponent, { initialState, backdrop: 'static' });
  }

  pinUnpinPost(attachmentId: string, isPinned: boolean) {
    this._postService
      .pinUnpinPost(attachmentId, isPinned)
      .subscribe((response) => {
        this.ngOnInit();
        console.log(response);
      });
  }

  openPostsViewModal(posts: string): void {
    const initialState = {
      posts: posts,
    };
    this.bsModalService.show(PostViewComponent, { initialState });
  }

  openClassCourseViewModal(item: string): void {
    const initialState = {
      classCourseItem: item,
    };
    this.bsModalService.show(ClassCourseModalComponent, { initialState });
  }

  hideUnhideFeedFilters(hideUnhide: boolean) {
    this.isFeedHide = false;
    if (hideUnhide) {
      this.hideFeedFilters = true;
    } else {
      this.hideFeedFilters = false;
    }
  }

  GetSchoolClassCourseList(schoolId: string,appliedFilters?:boolean,pageNumber?:number) {
    var school = this.school;
    this.isFeedHide = true;
    if(pageNumber != undefined){
      this.classCoursePageNumber = pageNumber;
    }
    if (this.classCourseList == undefined || appliedFilters) {
      this.loadingIcon = true;
      this.hideFeedFilters = false;
      this._schoolService.getSchoolClassCourseList(schoolId,this.classCoursePageNumber).subscribe((response) => {
          this.classCourseList = response;
          this.loadingIcon = false;
        });
    }
  }

  pinUnpinClassCourse(id: string, type: string, isPinned: boolean) {
    this._schoolService
      .pinUnpinClassCourse(id, type, isPinned)
      .subscribe((response) => {
        this.ngOnInit();
      });
  }

  schoolChat(userId: string, type: string, chatTypeId: string) {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    } else {
      this.router.navigate([`user/chats`], {
        state: {
          chatHead: { receiverId: userId, type: type, chatTypeId: chatTypeId },
        },
      });
    }
  }

  getDeletedId(id: string, type: any) {
    if (type == 1) {
      this._schoolService.deleteClass(id).subscribe((response) => {
        this.ngOnInit();
      });
    }
    if (type == 2) {
      this._schoolService.deleteCourse(id).subscribe((response) => {
        this.ngOnInit();
      });
    }
  }

  deleteClassCourse() {}

  likeUnlikePosts(postId: string, isLike: boolean,postType:number,post:any) {
    this.currentLikedPostId = postId;
    this.school.posts
      .filter((p: any) => p.id == postId)
      .forEach((item: any) => {
        var likes: any[] = item.likes;

        var isLiked = likes.filter(
          (x) => x.userId == this.userId && x.postId == postId
        );
        if (isLiked.length != 0) {
          this.isLiked = false;
          this.likesLength = item.likes.length - 1;
          item.isPostLikedByCurrentUser = false;
        } else {
          this.isLiked = true;
          this.likesLength = item.likes.length + 1;
          item.isPostLikedByCurrentUser = true;
          if(post.title != null){
            var notificationContent = `liked your post(${post.title})`;
          }
          else{
            var notificationContent = "liked your post";
          }
          this._notificationService.initializeNotificationViewModel(post.createdBy,NotificationType.Likes,notificationContent,this.userId,postId,postType,post,null).subscribe((response) => {
          });
        }
      });

    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000';
    this._postService
      .likeUnlikePost(this.likeUnlikePost)
      .subscribe((response) => {
        this.school.posts
          .filter((p: any) => p.id == postId)
          .forEach((item: any) => {
            var itemss = item.likes;
            item.likes = response;
          });

        this.InitializeLikeUnlikePost();
        console.log('succes');
      });
  }

  showPostDiv(postId: string) {
    var posts: any[] = this.school.posts;
    this.gridItemInfo = posts.find((x) => x.id == postId);
    this.isGridItemInfo = true;
    this.cd.detectChanges();
    const player = videojs(this.videoPlayer.nativeElement, {autoplay: false});
    this.addPostView(this.gridItemInfo.id);
  }

  addPostView(postId: string) {
    if (this.userId != undefined) {
      this.initializePostView();
      this.postView.postId = postId;
      this._postService.postView(this.postView).subscribe((response) => {
        this.gridItemInfo.views.length = response;
      });
    }
  }

  initializePostView() {
    this.postView = {
      postId: '',
      userId: '',
    };
  }

  hideGridItemInfo() {
    this.isGridItemInfo = this.isGridItemInfo ? false : true;
  }

  likeUnlikeClassCourse(Id: string, isLike: boolean, type: number) {
    this.currentLikedClassCourseId = Id;
    this.classCourseList
      .filter((p: any) => p.id == Id)
      .forEach((item: any) => {
        //   // here item.likes is null
        if (item.type == 1) {
          var likes: any[] = item.classLikes;
          var isLiked = likes.filter(
            (x) => x.userId == this.userId && x.classId == Id
          );
        } else {
          var likes: any[] = item.courseLikes;
          var isLiked = likes.filter(
            (x) => x.userId == this.userId && x.courseId == Id
          );
        }
        // var likes: any[] = item.likes;

        if (isLiked.length != 0) {
          this.isClassCourseLiked = false;
          if (item.type == 1) {
            this.likesClassCourseLength = item.classLikes.length - 1;
          } else {
            this.likesClassCourseLength = item.courseLikes.length - 1;
          }
          item.isLikedByCurrentUser = false;
        } else {
          this.isClassCourseLiked = true;
          if (item.type == 1) {
            this.likesClassCourseLength = item.classLikes.length + 1;
          } else {
            this.likesClassCourseLength = item.courseLikes.length + 1;
          }

          item.isLikedByCurrentUser = true;
        }
      });

    this.InitializeLikeUnlikeClassCourse();
    this.likeUnlikeClassCourses.Id = Id;
    this.likeUnlikeClassCourses.isLike = isLike;
    this.likeUnlikeClassCourses.type = type;

    this._schoolService
      .likeUnlikeClassCourse(this.likeUnlikeClassCourses)
      .subscribe((response) => {
        if (type == 1) {
          this.classCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.classLikes = response;
            });
        } else {
          this.classCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.courseLikes = response;
            });
        }

        this.InitializeLikeUnlikeClassCourse();
        console.log('succes');
      });
  }

  InitializeLikeUnlikeClassCourse() {
    this.likeUnlikeClassCourses = {
      isLike: false,
      userId: '',
      Id: '',
      type: 0,
    };
  }

  openReelsViewModal(postAttachmentId: string): void {
    const initialState = {
      postAttachmentId: postAttachmentId,
    };
    this.bsModalService.show(ReelsViewComponent, { initialState });
  }

  getClassFilters(){
    this._classService.getClassFilters(this.userId,this.school.schoolId).subscribe((classFilters) => {
      this.classFilters = classFilters;
      this.noOfAppliedClassFilters = this.classFilters[0].noOfAppliedFilters;
    });

  }

  getCourseFilters(){
    this._courseService.getCourseFilters(this.userId,this.school.schoolId).subscribe((courseFilters) => {
      this.courseFilters = courseFilters;
      this.noOfAppliedCourseFilters = this.courseFilters[0].noOfAppliedFilters;
    });

  }

  changeClassFilterSettings(id:string,isActive:boolean){
    var classFilters: any[] = this.classFilters;
    var item = classFilters.find(x => x.id == id);
    item.isFilterActive = isActive;

    var filterItem = {id:'',isActive:false,schoolId:''};
    filterItem.id = id;
    filterItem.isActive = isActive;
    filterItem.schoolId = this.school.schoolId;
    if(isActive){
      this.noOfAppliedClassFilters +=1;

    }
    if(!isActive){
      this.noOfAppliedClassFilters -=1;

    }
    var index = this.classFilterList.findIndex(x => x.id == id);
    if(index > -1){
    this.classFilterList.splice(index, 1);   
    }
    this.classFilterList.push(filterItem);
  }

  changeCourseFilterSettings(id:string,isActive:boolean){
    var courseFilters: any[] = this.courseFilters;
    var item = courseFilters.find(x => x.id == id);
    item.isFilterActive = isActive;

    var filterItem = {id:'',isActive:false,schoolId:''};
    filterItem.id = id;
    filterItem.isActive = isActive;
    filterItem.schoolId = this.school.schoolId;
    if(isActive){
      this.noOfAppliedCourseFilters +=1;

    }
    if(!isActive){
      this.noOfAppliedCourseFilters -=1;

    }
    var index = this.courseFilterList.findIndex(x => x.id == id);
    if(index > -1){
    this.courseFilterList.splice(index, 1);   
    }
    this.courseFilterList.push(filterItem);
  }

  saveClassFilters(){
    this._classService.saveClassFilters(this.classFilterList).subscribe((response) => {
      this.classFilterList = [];
      this.GetSchoolClassCourseList(this.school.schoolId,true,1);
    });
  }

  saveCourseFilters(){
    this._courseService.saveCourseFilters(this.courseFilterList).subscribe((response) => {
      this.courseFilterList = [];
      this.GetSchoolClassCourseList(this.school.schoolId,true,1);
    });
  }

  openCertificateViewModal(certificateUrl:string,certificateName:string){
    const initialState = {
      certificateUrl: certificateUrl,
      certificateName:certificateName,
      from:PostAuthorTypeEnum.School
    };
    this.bsModalService.show(CertificateViewComponent, { initialState });
  }

  openSharePostModal(postId:string, postType:number): void {
    const initialState = {
      postId: postId,
      postType: postType
    };
    this.bsModalService.show(SharePostComponent,{initialState});
  }

  savePost(postId:string){
    var posts: any[] = this.school.posts;
    var isSavedPost = posts.find(x => x.id == postId);
  
    if(isSavedPost.isPostSavedByCurrentUser){
      isSavedPost.savedPostsCount -= 1;
      isSavedPost.isPostSavedByCurrentUser = false;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
     }
     else{
      isSavedPost.savedPostsCount += 1;
      isSavedPost.isPostSavedByCurrentUser = true;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post saved successfully'});
     }
  
    this._postService.savePost(postId,this.userId).subscribe((result) => {
    });
  }

  saveClassCourse(id:string,type:number){
    var classCourseList: any[] = this.classCourseList;
    var isSavedClassCourse = classCourseList.find(x => x.id == id);
  
    if(isSavedClassCourse.isClassCourseSavedByCurrentUser){
      isSavedClassCourse.savedClassCourseCount -= 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = false;
      if(type == 1){
        this.savedMessage = 'Class saved successfully';
        this.removedMessage = 'Class removed successfully'
      }
      if(type == 2){
        this.savedMessage = 'Course saved successfully';
        this.removedMessage = 'Course removed successfully'
      }
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:this.removedMessage});
     }
     else{
      isSavedClassCourse.savedClassCourseCount += 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = true;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:this.savedMessage});
     }
  
    this._schoolService.saveClassCourse(id,this.userId,type).subscribe((result) => {
    });
  }

}
