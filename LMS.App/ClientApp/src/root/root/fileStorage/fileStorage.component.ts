import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { Constant } from 'src/root/interfaces/constant';
import { SaveFilesViewModel } from 'src/root/interfaces/fileStorage/saveFilesViewModel';
import { ChatService } from 'src/root/service/chatService';
import { FileStorageService } from 'src/root/service/fileStorage';
import { SchoolService } from 'src/root/service/school.service';
import { commentDeleteResponse, commentResponse, progressResponse, SignalrService } from 'src/root/service/signalr.service';
import { TeacherService } from 'src/root/service/teacher.service';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';
import { postProgressNotification, postUploadOnBlob } from '../root.component';


import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';


export const fileStorageResponse = new Subject<{ fileStorageResponse: any; availableSpace: number }>();

@Component({
  selector: 'fileStorage',
  templateUrl: './fileStorage.component.html',
  styleUrls: ['./fileStorage.component.css'],
  providers: [MessageService]
})

export class FileStorageComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _fileStorageService;
  private _userService;
  private _signalRService;
  private _chatService;
  private _teacherService;
  private _schoolService;
  saveFolderForm!: FormGroup;
  isSubmitted: boolean = false;
  loadingIcon: boolean = false;
  parentId!: string;
  folders!: any;
  isDataLoaded: boolean = false;
  filesForm!: FormGroup;
  files!: any;
  saveFileViewModel!: SaveFilesViewModel;
  filesToUpload = new FormData();
  parentFolderId: string = "";
  folderName: string = "";
  folderId: string = "";
  isOpenCommentsSection: boolean = false;
  messageToGroup!: string;
  sender: any;
  senderId!: string;
  fileCommentsPageNumber: number = 1;
  fileComments!: any;
  commentViewModel!: CommentViewModel;
  fileId!: string;
  commentsScrolled: boolean = false;
  scrollCommentsResponseCount: number = 1;
  commentsLoadingIcon: boolean = false;
  folderLocation: string = Constant.FileStorage;
  isFirstPage!: boolean;
  previousFolders!: any;
  previousFiles!: any;
  isFoldersEmpty!: boolean;
  isTeachersEmpty: boolean = true;
  isFilesEmpty!: boolean;
  isOpenSidebar: boolean = false;
  isOpenSearch: boolean = false;
  searchString: string = "";
  fileStorageType!: string;
  teachers: any;
  isClassTeacher!: boolean;
  isCourseTeacher!: boolean;
  isOwner!: boolean;
  foldersPageNumber: number = 1;
  filesPageNumber: number = 1;
  totalFolderRecords!: number;
  totalFileRecords!: number;
  folderItemsPerPage: number = 8;
  fileItemsPerPage: number = 10;
  folderRecords: any;
  fileRecords: any;
  progressBarValue: number = 0;
  fileSize: number = 0;
  filesModalInterval: any;
  progressFileName!: string;
  ownerId!: string;
  fileCount: number = 1;
  totalUploadFilesSize: number = 0;
  progressSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  commentResponseSubscription!: Subscription;
  fileStorageResponseSubscription!: Subscription;
  schoolId: string = "";
  availableSpace: number = 0;
  showModal: boolean = true;
  hamburgerCountSubscription!: Subscription;
  hamburgerCount:number = 0;

  commentDeletdResponseSubscription!:Subscription;

  private _notificationService;


  @ViewChild('closeFileModal') closeFileModal!: ElementRef;
  @ViewChild('closeFolderModal') closeFolderModal!: ElementRef;
  @ViewChild('groupChatList') groupChatList!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;


  constructor(injector: Injector, private fb: FormBuilder,notificationService: NotificationService,private bsModalService: BsModalService, private translateService: TranslateService, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, userService: UserService, public fileStorageService: FileStorageService, signalRService: SignalrService, chatService: ChatService, teacherService: TeacherService, public messageService: MessageService, private cd: ChangeDetectorRef, schoolService: SchoolService) {
    super(injector);
    this._userService = userService;
    this._fileStorageService = fileStorageService;
    this._signalRService = signalRService;
    this._chatService = chatService;
    this._teacherService = teacherService;
    this._schoolService = schoolService;
    this._notificationService = notificationService;
  }

  ngOnInit(): void {
    debugger
    this.loadingIcon = true;
    this.isFirstPage = true;
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.translate.use(selectedLang ?? '');
    this.parentId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.ownerId = this.activatedRoute.snapshot.paramMap.get('ownerId') ?? '';
    this.schoolId = this.activatedRoute.snapshot.paramMap.get('schoolId') ?? '';
    this.fileStorageType = this.activatedRoute.snapshot.paramMap.get('type') ?? '';

    if (this.fileStorageType == "1") {
      this.getClassTeachers(this.parentId);
    }
    else {
      this.getCourseTeachers(this.parentId);
    }
    this.getFolders();
    this.getFiles();

    this.saveFolderForm = this.fb.group({
      folderName: this.fb.control([], [Validators.required]),
      parentId: this.fb.control(''),
      parentFolderId: this.fb.control('')
    });

    this.filesForm = this.fb.group({
      files: this.fb.control([], [Validators.required]),
    });

    this.initializeSaveFileViewModel();
    this.getLoginUserInfo();
    this.commentResponse();

    this.progressSubscription = progressResponse.subscribe(response => {
      this.progressBarValue = response.progressCount;
      if (this.progressBarValue == 100 && this.saveFileViewModel.files.length != this.fileCount) {
        this.fileCount += 1;
      }
      this.progressFileName = response.fileName;
      this.cd.detectChanges();
    });

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    if (!this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
        debugger
        this.hamburgerCount = response.hamburgerCount;
      });
    }
    notifyMessageAndNotificationCount.next({});

    this.isOwnerOrNot();

    if (!this.fileStorageResponseSubscription) {
      this.fileStorageResponseSubscription = fileStorageResponse.subscribe(result => {
        debugger
        this.isSubmitted = false;
        this.loadingIcon = false;
        this.files = result.fileStorageResponse.concat(this.files);
        this.availableSpace = this.availableSpace - result.availableSpace;
        this.availableSpace = parseFloat(this.availableSpace.toFixed(2));
        this.getFilesSelectedPage();
        this.totalFolderRecords = this.files.length;
        this.saveFileViewModel.files = [];
        this.filesToUpload.set('files', '');
        this.closeFilesModal();
      });
    }
    if(!this.commentDeletdResponseSubscription){
      commentDeleteResponse.subscribe(response =>{
        debugger;
        let indexOfComment = this.fileComments.findIndex((x:any) => x.id == response.commentId)
        this.fileComments.splice(indexOfComment, 1)
      })
    }
  }

  ngOnDestroy() {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.commentResponseSubscription) {
      this.commentResponseSubscription.unsubscribe();
    }
    if (this.fileStorageResponseSubscription) {
      this.fileStorageResponseSubscription.unsubscribe();
    }
    if (this.commentDeletdResponseSubscription) {
      this.commentDeletdResponseSubscription.unsubscribe();
    }
  }
    if (this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription.unsubscribe();
    }
  }

  userId:string='' 
  isOwnerOrNot() {
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      var loginUserId = decodedJwtData.jti;
      this.userId = loginUserId;
      if (loginUserId == this.ownerId) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
      }
    }
    debugger;
  }

  getClassTeachers(classId: string) {
    this._teacherService.getClassTeachers(classId).subscribe((response: any) => {
      this.teachers = response;
      this.isTeachersEmpty = false;
      var teachers: any[] = this.teachers;
      var classTeacher = teachers.find(x => x.teacher.userId == this.senderId || x.class.createdById == this.senderId || x.class.school.createdById == this.senderId);
      if (classTeacher != null) {
        this.isClassTeacher = true;
      }
      this.checkFoldersAndFilesExist();
    });
  }

  getCourseTeachers(courseId: string) {
    this._teacherService.getCourseTeachers(courseId).subscribe((response: any) => {
      this.teachers = response;
      this.isTeachersEmpty = false;
      var teachers: any[] = this.teachers;
      var courseTeacher = teachers.find(x => x.teacher.userId == this.senderId || x.course.createdById == this.senderId || x.course.school.createdById == this.senderId);
      if (courseTeacher != null) {
        this.isCourseTeacher = true;
      }
      this.checkFoldersAndFilesExist();
    });
  }

  getFolders(pageNumber?: number) {
    this._fileStorageService.getFolders(this.parentId, this.searchString).subscribe((response: any) => {
      this.folders = response;
      this.parentFolderId = this.folders[0]?.parentFolderId;
      this.isFoldersEmpty = false;
      this.totalFolderRecords = this.folders.length;
      this._schoolService.getSchool(this.schoolId).subscribe((response: any) => {
        debugger
        this.availableSpace = response.availableStorageSpace;


        if (response.availableStorageSpace <= 0) {
          this.showModal = false;
        }
      });
      this.getFoldersSelectedPage();
      this.checkFoldersAndFilesExist();
    });
  }

  getFiles() {
    this._fileStorageService.getFiles(this.parentId, this.searchString).subscribe((response: any) => {
      this.files = response;
      this.isFilesEmpty = false;
      this.totalFileRecords = this.files.length;
      this.getFilesSelectedPage();
      this.checkFoldersAndFilesExist()
    });
  }

  checkFoldersAndFilesExist() {
    if (!this.isFoldersEmpty && !this.isFilesEmpty && !this.isTeachersEmpty) {
      this.isDataLoaded = true;
      this.loadingIcon = false;
    }
  }

  getFoldersSelectedPage(event?: any) {
    if (event == undefined) {
      var startIndex = ((this.foldersPageNumber) - 1) * this.folderItemsPerPage;
    }
    else {
      var startIndex = ((event.page + 1) - 1) * this.folderItemsPerPage;
    }
    var endIndex = startIndex + this.folderItemsPerPage;
    this.folderRecords = this.folders.slice(startIndex, endIndex);
  }

  getFilesSelectedPage(event?: any) {
    if (event == undefined) {
      var startIndex = ((this.filesPageNumber) - 1) * this.fileItemsPerPage;
    }
    else {
      var startIndex = ((event.page + 1) - 1) * this.fileItemsPerPage;
    }
    const endIndex = startIndex + this.fileItemsPerPage;
    this.fileRecords = this.files.slice(startIndex, endIndex);
  }

  getLoginUserInfo() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.senderId = decodedJwtData.jti;

      this._userService.getUser(this.senderId).subscribe((response: any) => {
        this.sender = response;
      });
    }
  }

  saveFolder() {
    this.isSubmitted = true;
    if (!this.saveFolderForm.valid) {
      return;
    }

    var folderName = this.saveFolderForm.get('folderName')?.value;
    this._fileStorageService.isFolderNameExist(folderName, this.parentId, this.parentFolderId).subscribe((response) => {
      if (response) {
        this.saveFolderForm.setErrors({ folderNameAlreadyExist: true });
        return;
      }
      else {
        this.loadingIcon = true;
        this.saveFolderForm.controls.parentId.setValue(this.parentId);
        if (this.parentFolderId == "") {
          this.saveFolderForm.controls.parentFolderId.setValue(null);
        }
        else {
          this.saveFolderForm.controls.parentFolderId.setValue(this.parentFolderId);
        }
        var formValues = this.saveFolderForm.value;
        this._fileStorageService.saveFolder(formValues).subscribe((response: any) => {
          this.closeFoldersModal();
          this.isSubmitted = false;
          this.folders.unshift(response);
          this.getFoldersSelectedPage();
          this.totalFolderRecords = this.folders.length;
          this.loadingIcon = false;
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Folder added successfully', });
        });
      }
    });

    //   this.loadingIcon = true;
    //   this.saveFolderForm.controls.parentId.setValue(this.parentId);
    //   if(this.parentFolderId == ""){
    //     this.saveFolderForm.controls.parentFolderId.setValue(null);
    //   }
    //   else{
    //     this.saveFolderForm.controls.parentFolderId.setValue(this.parentFolderId);
    //   }
    //   var formValues = this.saveFolderForm.value;
    //   this._fileStorageService.saveFolder(formValues).subscribe((response: any) => {
    //     this.closeFoldersModal();
    //   this.isSubmitted = false;
    //   this.folders.unshift(response);
    //   this.getFoldersSelectedPage();
    //   this.totalFolderRecords = this.folders.length;
    //   this.loadingIcon = false;
    //   this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Folder added successfully',});
    // });
  }

  // handleFiles(event: any) {
  //   debugger;
  //   var selectedFiles = event.target.files;
  //   this.isSubmitted = false;
  //   for (let i = 0; i < selectedFiles.length; i++) {
  //     this.saveFileViewModel.files.push(selectedFiles[i]);
  //   }
  // }

  handleFiles(event: any) {
    debugger;
    var selectedFiles = event.target.files;
    this.isSubmitted = false;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      if (file.type === 'application/vnd.ms-powerpoint' || 
        file.type === 'application/pdf' || 
        file.type.startsWith('application/msword') || 
        file.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml') || 
        file.type.startsWith('text/') || 
        file.type.startsWith('image/')) {
          this.saveFileViewModel.files.push(file);
      } else {
        const translatedSummary = this.translateService.instant('Info');
        const translatedMessage = this.translateService.instant('AudioOrVideoTypeNotAllowed');
        this.messageService.add({
          severity: 'info',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
      }
    }
  }


  initializeSaveFileViewModel() {
    this.saveFileViewModel = {
      folderId: '',
      files: [],
    };
  }

  saveFiles() {
    debugger
    this.isSubmitted = true;
    if (!this.filesForm.valid) {
      return;
    }
    // this.loadingIcon = true;
    this.progressBarValue = 0;
    this.cd.detectChanges();
    // for (var i = 0; i < this.saveFileViewModel.files.length; i++) {
    //   this.fileSize += this.saveFileViewModel.files[i].size;
    //   this.filesToUpload.append(
    //     'files',
    //     this.saveFileViewModel.files[i]
    //   );
    // }

    this.filesToUpload.append('parentId', this.parentId);
    if (this.parentFolderId != "") {
      this.filesToUpload.append('folderId', this.parentFolderId);
    }

    for (const file of this.saveFileViewModel.files) {
      // Add the size of the current file to the totalSize variable
      this.totalUploadFilesSize += file.size;
    }

    if (this.totalUploadFilesSize < 5000000) {
      this.loadingIcon = true;
    }
    else {
      this.loadingIcon = true;
      setTimeout(() => {
        debugger
        this.closeFilesModal();
        this.loadingIcon = false;
        postProgressNotification.next({ from: Constant.FileStorage });
      }, 3000);
    }

    postUploadOnBlob.next({ postToUpload: this.filesToUpload, combineFiles: this.saveFileViewModel.files, videos: null, images: null, attachment: null, type: 4, reel: null, uploadedUrls: [], schoolId: this.schoolId });

    // this._fileStorageService.saveFiles(this.filesToUpload).subscribe(response => {
    //     this.isSubmitted = false;
    //     this.loadingIcon = false;
    //     this.files = response.concat(this.files);
    //     this.getFilesSelectedPage();
    //     this.totalFolderRecords = this.files.length;
    //     this.saveFileViewModel.files = [];
    //     this.filesToUpload.set('files', '');
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       life: 3000,
    //       detail: 'Files added successfully',
    //     });

    //     this.closeFilesModal();
    //   });

  }

  private closeFoldersModal(): void {
    this.closeFolderModal.nativeElement.click();
  }

  private closeFilesModal(): void {
    this.closeFileModal.nativeElement.click();
  }

  getNestedFolders(folderId: string, folderName: string) {
    this.loadingIcon = true;
    this.isDataLoaded = false;
    this.isFirstPage = false;
    this.isOpenCommentsSection = false;
    if (folderName != "") {
      this.folderLocation = this.folderLocation + "/" + folderName;
    }
    this.parentFolderId = folderId;
    this.folderName = folderName;
    this.previousFolders = this.folders;
    this.previousFiles = this.files;
    this.folderId = folderId;
    this.folders = null;
    this.files = null;
    this._fileStorageService.getNestedFolders(folderId, this.searchString).subscribe((response: any) => {
      this.folders = response.folders;
      this.files = response.files;
      this.getFoldersSelectedPage();
      this.totalFolderRecords = this.folders.length;
      this.getFilesSelectedPage();
      this.totalFileRecords = this.files.length;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });
  }

  openCommentsSection(fileId: string) {
    this.loadingIcon = true;
    this.commentsScrolled = false;
    this.scrollCommentsResponseCount = 1;
    this.fileCommentsPageNumber = 1;
    this.fileId = fileId;
    this.getFileComments(fileId);
    this._signalRService.createGroupName(fileId);
  }

  getFileComments(fileId: string) {
    this.fileCommentsPageNumber = 1;
    this._chatService.getComments(fileId, this.fileCommentsPageNumber).subscribe((response) => {
      this.fileComments = response;
      this.loadingIcon = false;
      this.isOpenCommentsSection = true;
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
    });
  }

  closeCommentsSection() {
    this.isOpenCommentsSection = false;
  }

  downloadFile(fileUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  }

  resetFolderModal() {
    if (this.availableSpace <= 0) {
      const translatedSummary = this.translateService.instant('Info');
      const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
      this.messageService.add({
        severity: 'info',
        summary: translatedSummary,
        life: 3000,
        detail: translatedMessage,
      });
      return;
    }

    this.isSubmitted = false;
    this.saveFolderForm.patchValue({
      folderName: ""
    });
  }

  resetFilesModal() {
    if (this.availableSpace <= 0) {
      const translatedSummary = this.translateService.instant('Info');
      const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
      this.messageService.add({
        severity: 'info',
        summary: translatedSummary,
        life: 3000,
        detail: translatedMessage,
      });
      return;
    }

    this.fileCount = 1;
    this.isSubmitted = false;
    clearInterval(this.filesModalInterval);
    this.saveFileViewModel.files = [];
    this.progressBarValue = 0;
  }

  openSearch() {
    this.isOpenSearch = true;
  }

  closeSearch() {
    this.isOpenSearch = false;
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  sendToGroup() {
    if (!this.messageToGroup || this.messageToGroup.trim().length == 0) {
      return;
    }
    var comment: any[] = this.fileComments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.fileId + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.commentViewModel.isUserVerified = this.sender.isVarified;
    this.messageToGroup = "";
    this.commentViewModel.id = Constant.defaultGuid;
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      comment.push(response);
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      this.commentViewModel.id = response.id;
      this.commentViewModel.createdOn = response.createdOn;
      this.commentViewModel.userName = response.user.firstName + " " + response.user.lastName;
      this._signalRService.sendToGroup(this.commentViewModel);
    });
  }

  InitializeCommentViewModel() {
    this.commentViewModel = {
      id: '',
      userId: '',
      content: '',
      groupName: '',
      userAvatar: '',
      createdOn: new Date(),
      userName: '',
      isUserVerified: false
    };
  }

  @HostListener('scroll', ['$event'])
  scrollHandler(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      if (!this.commentsScrolled && this.scrollCommentsResponseCount != 0) {
        this.commentsScrolled = true;
        this.commentsLoadingIcon = true;
        this.fileCommentsPageNumber++;
        this.getNextComments();
      }
    }
  }

  getNextComments() {
    this._chatService.getComments(this.fileId, this.fileCommentsPageNumber).subscribe((response) => {
      this.fileComments = response.concat(this.fileComments);
      this.cd.detectChanges();
      this.commentsLoadingIcon = false;
      this.scrollCommentsResponseCount = response.length;
      this.commentsScrolled = false;
      const chatList = this.groupChatList.nativeElement;
      const chatListHeight = chatList.scrollHeight;
      if (response.length != 0) {
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.clientHeight;
        const scrollOptions = {
          duration: 300,
          easing: 'ease-in-out'
        };
        chatList.scrollTo({
          top: this.groupChatList.nativeElement.scrollTop,
          left: 0,
          ...scrollOptions
        });
      }
    });
  }

  commentResponse() {
    if (!this.commentResponseSubscription) {
      this.commentResponseSubscription = commentResponse.subscribe(response => {
        var comment: any[] = this.fileComments;
        var commentObj = { id: response.id, content: response.message, likeCount: 0, isCommentLikedByCurrentUser: false, userAvatar: response.senderAvatar, createdOn: response.createdOn, userName: response.userName, isUserVerified: response.isUserVerified };
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
    }
  }

  back() {
    this.isOpenCommentsSection = false;
    if (this.isFirstPage) {
      window.history.back();
    }
    else {
      this.folderLocation;
      var index = this.folderLocation.lastIndexOf("/");
      this.folderLocation = this.folderLocation.slice(0, index);

      if (this.folderLocation == Constant.FileStorage) {
        this.loadingIcon = true;
        this.getFolders();
        this.getFiles();
        this.isFirstPage = true;
      }
      else {
        this.loadingIcon = true;
        this.folders = this.previousFolders;
        this.parentFolderId = this.folders[0].parentFolderId;
        this.getFoldersSelectedPage();
        this.totalFolderRecords = this.folders.length;
        this.files = this.previousFiles;
        this.getFilesSelectedPage();
        this.totalFileRecords = this.files.length;
        this.loadingIcon = false;
      }
    }
  }

  FoldersAndFilesSearch(value: string) {
    this.foldersPageNumber = 1;
    if (this.searchString.length > 2 || this.searchString == "") {
      if (this.isFirstPage) {
        this._fileStorageService.getFolders(this.parentId, this.searchString).subscribe((response: any) => {
          this.folders = response;
          this.getFoldersSelectedPage();
          this.totalFolderRecords = this.folders.length;
          this.isFoldersEmpty = false;
          this.checkFoldersAndFilesExist()
        });

        this._fileStorageService.getFiles(this.parentId, this.searchString).subscribe((response: any) => {
          this.files = response;
          this.getFilesSelectedPage();
          this.totalFileRecords = this.files.length;
          this.isFilesEmpty = false;
          this.checkFoldersAndFilesExist()
        });
      }
      else {
        this._fileStorageService.getNestedFolders(this.folderId, this.searchString).subscribe((response: any) => {
          this.folders = response.folders;
          this.files = response.files;
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });
      }
    }
  }

  deleteFolder() {
    this.loadingIcon = true;
    let folderId = this.fileFolderIdForDelete
    this._fileStorageService.deleteFolder(folderId).subscribe((response: any) => {
      this.loadingIcon = false;
      if (response.message == Constant.FolderCantDeleted) {
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'You can not delete folder without deleting the folders/files under it', });
      }
      else {
        this.folders = this.folders.filter((x: { id: any; }) => x.id !== folderId);
        this.folderRecords = this.folderRecords.filter((x: { id: any; }) => x.id !== folderId);
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Folder deleted successfully', });
      }
    });
  }

  fileFolderIdForDelete:string = '';
  forFile:boolean = false;
  openFileDeleteModel(fileId:string, issFrom:string){
    debugger;
    if(issFrom == "file"){
      this.forFile = true;
    } else{
      this.forFile = false;
    }
    this.fileFolderIdForDelete = fileId;
  }

  deleteFile() {
    let fileId = this.fileFolderIdForDelete;
    this._fileStorageService.deleteFile(fileId).subscribe((response: any) => {
      this.files = this.files.filter((x: { id: any; }) => x.id !== fileId);
      this.fileRecords = this.fileRecords.filter((x: { id: any; }) => x.id !== fileId);
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'File deleted successfully', });
    });
  }


  deleteComment(item:any){
    debugger;
    // this.initializeCommentLikeUnlike();
    // this.commentLikeUnlike.userId = item.userId;
    // this.commentLikeUnlike.commentId = item.id;
    // this.commentLikeUnlike.groupName = item.groupName;
    // if(this.userId == item.userId){
    //   this._signalrService.notifyCommentDelete(this.commentLikeUnlike);
    //   let indexOfComment = this.post.comments.findIndex((x:any) => x.id == this.commentLikeUnlike.commentId);
    //   this.post.comments.splice(indexOfComment, 1);
    // }
    const initialState = { item : item, from : "deleteComment" };
    this.bsModalService.show(DeleteConfirmationComponent, { initialState });
  }

  likeUnlikeComments(commentId: string, _isLike: boolean, _isCommentLikedByCurrentUser: boolean, _likeCount: number) {
    debugger;
    var comment: any[] = this.fileComments;
    var isCommentLiked = comment.find(x => x.id == commentId);
    this.initializeCommentLikeUnlike();
    this.commentLikeUnlike.userId = this.sender.id;
    this.commentLikeUnlike.commentId = commentId;
    this.commentLikeUnlike.groupName = comment[0].groupName;
    if (isCommentLiked.isCommentLikedByCurrentUser) {
      isCommentLiked.isCommentLikedByCurrentUser = false;
      isCommentLiked.likeCount = isCommentLiked.likeCount - 1;
      this.commentLikeUnlike.isLike = false;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
    }
    else {
      isCommentLiked.isCommentLikedByCurrentUser = true;
      isCommentLiked.likeCount = isCommentLiked.likeCount + 1;

      this.commentLikeUnlike.isLike = true;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
    }
    // if(this.sender.id != isCommentLiked.user.id){
      this._signalRService.notifyCommentLike(this.commentLikeUnlike);
      debugger;
      if(isCommentLiked.user.id != this.sender.id && this.commentLikeUnlike.isLike){
        debugger;
        var translatedMessage = this.translateService.instant('liked your comment');
        var notificationContent = translatedMessage;
        this._notificationService.initializeNotificationViewModel(isCommentLiked.user.id, NotificationType.CommentSent, notificationContent, this.sender.id, this.files.id, this.files, null, null).subscribe((response) => {
      });
    }

    // }
    // this._signalRService.sendNotification();
  }
  initializeCommentLikeUnlike() {
    this.commentLikeUnlike = {
      commentId: "",
      userId: "",
      likeCount: 0,
      isLike: false,
      groupName: ""
    }

  }

  commentLikeUnlike!: CommentLikeUnlike;

}
