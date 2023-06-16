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
import { commentResponse, progressResponse, SignalrService } from 'src/root/service/signalr.service';
import { TeacherService } from 'src/root/service/teacher.service';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';

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
    saveFolderForm!: FormGroup;
    isSubmitted: boolean = false;
    loadingIcon: boolean = false;
    parentId!:string;
    folders!:any;
    isDataLoaded:boolean = false;
    filesForm!: FormGroup;
    files!: any;
    saveFileViewModel!: SaveFilesViewModel;
    filesToUpload = new FormData();
    parentFolderId:string = "";
    folderName:string = "";
    folderId:string = "";
    isOpenCommentsSection: boolean = false;
    messageToGroup!:string;
    sender:any;
    senderId!:string;
    fileCommentsPageNumber:number = 1;
    fileComments!:any;
    commentViewModel!: CommentViewModel;
    fileId!:string;
    commentsScrolled:boolean = false;
    scrollCommentsResponseCount:number = 1;
    commentsLoadingIcon: boolean = false;
    folderLocation: string = Constant.FileStorage;
    isFirstPage!:boolean;
    previousFolders!:any;
    previousFiles!:any;
    isFoldersEmpty!:boolean;
    isTeachersEmpty:boolean = true;
    isFilesEmpty!:boolean;
    isOpenSidebar:boolean = false;
    isOpenSearch:boolean = false;
    searchString:string = "";
    fileStorageType!:string;
    teachers:any;
    isClassTeacher!:boolean;
    isCourseTeacher!:boolean;
    isOwner!:boolean;
    foldersPageNumber:number = 1;
    filesPageNumber:number = 1;
    totalFolderRecords!:number;
    totalFileRecords!:number;
    folderItemsPerPage: number = 8;
    fileItemsPerPage: number = 10;
    folderRecords:any;
    fileRecords:any;
    progressBarValue:number = 0;
    fileSize:number = 0;
    filesModalInterval:any;
    progressFileName!:string;
    ownerId!:string;
    fileCount:number = 1;
    progressSubscription!: Subscription;
    changeLanguageSubscription!: Subscription;

    @ViewChild('closeFileModal') closeFileModal!: ElementRef;
    @ViewChild('closeFolderModal') closeFolderModal!: ElementRef;
    @ViewChild('groupChatList') groupChatList!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;


    constructor(injector: Injector,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,userService:UserService,fileStorageService:FileStorageService,signalRService:SignalrService,chatService:ChatService,teacherService:TeacherService,public messageService:MessageService,private cd: ChangeDetectorRef) { 
      super(injector);
      this._userService = userService; 
      this._fileStorageService = fileStorageService;
      this._signalRService = signalRService;
      this._chatService = chatService;
      this._teacherService = teacherService;
    }
  
    ngOnInit(): void {
      this.loadingIcon = true;
      this.isFirstPage = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.parentId = this.activatedRoute.snapshot.paramMap.get('id')??'';
      this.ownerId = this.activatedRoute.snapshot.paramMap.get('ownerId')??'';
      this.fileStorageType = this.activatedRoute.snapshot.paramMap.get('type')??'';

      if(this.fileStorageType == "1"){
        this.getClassTeachers(this.parentId);
      }
      else{
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
        if(this.progressBarValue == 100 && this.saveFileViewModel.files.length != this.fileCount){
           this.fileCount += 1;
        }
        this.progressFileName = response.fileName;
        this.cd.detectChanges();
      });

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

      this.isOwnerOrNot();
    }

    ngOnDestroy() {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      if(this.progressSubscription){
        this.progressSubscription.unsubscribe();
      }
    }

    isOwnerOrNot() {
      var validToken = localStorage.getItem('jwt');
      if (validToken != null) {
        let jwtData = validToken.split('.')[1];
        let decodedJwtJsonData = window.atob(jwtData);
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        var loginUserId = decodedJwtData.jti;
        if (loginUserId == this.ownerId) {
          this.isOwner = true;
        } else {
          this.isOwner = false;
        }
      }
    }

    getClassTeachers(classId:string){
      this._teacherService.getClassTeachers(classId).subscribe((response: any) => {
        this.teachers = response;
        this.isTeachersEmpty = false;
        var teachers: any[] = this.teachers;
        var classTeacher = teachers.find(x =>  x.teacher.userId == this.senderId || x.class.createdById == this.senderId || x.class.school.createdById == this.senderId);
        if(classTeacher != null){
           this.isClassTeacher = true;
        }
        this.checkFoldersAndFilesExist();
        });
    }

    getCourseTeachers(courseId:string){
      this._teacherService.getCourseTeachers(courseId).subscribe((response: any) => {
        this.teachers = response;
        this.isTeachersEmpty = false;
        var teachers: any[] = this.teachers;
        var courseTeacher = teachers.find(x =>  x.teacher.userId == this.senderId || x.course.createdById == this.senderId || x.course.school.createdById == this.senderId);
        if(courseTeacher != null){
           this.isCourseTeacher = true;
        }
        this.checkFoldersAndFilesExist();
        });
    }

    getFolders(pageNumber?: number){
      this._fileStorageService.getFolders(this.parentId,this.searchString).subscribe((response: any) => {
        this.folders = response;
        this.parentFolderId = this.folders[0].parentFolderId;
        this.isFoldersEmpty = false;
        this.totalFolderRecords = this.folders.length;
        this.getFoldersSelectedPage();
        this.checkFoldersAndFilesExist();
        });
    }

    getFiles(){
      this._fileStorageService.getFiles(this.parentId,this.searchString).subscribe((response: any) => {
        this.files = response;
        this.isFilesEmpty = false;
        this.totalFileRecords = this.files.length;
        this.getFilesSelectedPage();
        this.checkFoldersAndFilesExist()
        });
    }

    checkFoldersAndFilesExist(){
        if(!this.isFoldersEmpty && !this.isFilesEmpty && !this.isTeachersEmpty){
          this.isDataLoaded = true;
          this.loadingIcon = false;
        }
    }

    getFoldersSelectedPage(event?:any){
      if(event == undefined){
        var startIndex = ((this.foldersPageNumber) - 1) * this.folderItemsPerPage;
      }
      else{
        var startIndex = ((event.page + 1) - 1) * this.folderItemsPerPage;
      }
      var endIndex = startIndex + this.folderItemsPerPage;
      this.folderRecords = this.folders.slice(startIndex, endIndex);
    }

    getFilesSelectedPage(event?:any){
      if(event == undefined){
        var startIndex = ((this.filesPageNumber) - 1) * this.fileItemsPerPage;
      }
      else{
        var startIndex = ((event.page + 1) - 1) * this.fileItemsPerPage;
      }
      const endIndex = startIndex + this.fileItemsPerPage;
      this.fileRecords = this.files.slice(startIndex, endIndex);
    }

    getLoginUserInfo(){
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

    saveFolder(){
        this.isSubmitted = true;
        if (!this.saveFolderForm.valid) {
          return;
        }

        var folderName = this.saveFolderForm.get('folderName')?.value;
        this._fileStorageService.isFolderNameExist(folderName,this.parentId,this.parentFolderId).subscribe((response) => {
        if(response){
          this.saveFolderForm.setErrors({ folderNameAlreadyExist: true });
          return;
        }
        else{
          this.loadingIcon = true;
          this.saveFolderForm.controls.parentId.setValue(this.parentId);
          if(this.parentFolderId == ""){
            this.saveFolderForm.controls.parentFolderId.setValue(null);
          }
          else{
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
          this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Folder added successfully',});
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

    handleFiles(event: any) {
      var selectedFiles = event.target.files;
      this.isSubmitted = false;
      for (let i = 0; i < selectedFiles.length; i++) {
        this.saveFileViewModel.files.push(selectedFiles[i]);
      }
    }

    initializeSaveFileViewModel(){
    this.saveFileViewModel = {
      folderId: '',
      files: [],
    };
  }

  saveFiles() {
    this.isSubmitted = true;
    if (!this.filesForm.valid) {
      return;
    }
    // this.loadingIcon = true;
    this.progressBarValue = 0;
    this.cd.detectChanges();
    for (var i = 0; i < this.saveFileViewModel.files.length; i++) {
      this.fileSize += this.saveFileViewModel.files[i].size;
      this.filesToUpload.append(
        'files',
        this.saveFileViewModel.files[i]
      );
    }

    this.filesToUpload.append('parentId', this.parentId);
      if(this.parentFolderId != ""){
        this.filesToUpload.append('folderId', this.parentFolderId);
      }

    this._fileStorageService.saveFiles(this.filesToUpload).subscribe(response => {
        this.isSubmitted = false;
        this.loadingIcon = false;
        this.files = response.concat(this.files);
        this.getFilesSelectedPage();
        this.totalFolderRecords = this.files.length;
        this.saveFileViewModel.files = [];
        this.filesToUpload.set('files', '');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Files added successfully',
        });

        this.closeFilesModal();
      });
      
  }

  private closeFoldersModal(): void {
    this.closeFolderModal.nativeElement.click();
  }

  private closeFilesModal(): void {
    this.closeFileModal.nativeElement.click();
  }

  getNestedFolders(folderId:string,folderName:string){
    this.loadingIcon = true;
    this.isDataLoaded = false;
    this.isFirstPage = false;
    this.isOpenCommentsSection = false;
    if(folderName != ""){
      this.folderLocation = this.folderLocation + "/" + folderName;
    }
    this.parentFolderId = folderId;
    this.folderName = folderName;
    this.previousFolders = this.folders;
    this.previousFiles = this.files;
    this.folderId = folderId;
    this.folders = null;
    this.files = null;
    this._fileStorageService.getNestedFolders(folderId,this.searchString).subscribe((response: any) => {
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

  openCommentsSection(fileId:string){
    this.loadingIcon = true;
    this.commentsScrolled = false;
    this.scrollCommentsResponseCount = 1;
    this.fileCommentsPageNumber = 1;
    this.fileId = fileId;
    this.getFileComments(fileId);
    this._signalRService.createGroupName(fileId);
  }

  getFileComments(fileId:string){
    this.fileCommentsPageNumber = 1;
    this._chatService.getComments(fileId,this.fileCommentsPageNumber).subscribe((response) => {
      this.fileComments = response;
      this.loadingIcon = false;
      this.isOpenCommentsSection = true;
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
  }

  closeCommentsSection(){
    this.isOpenCommentsSection = false;
  }

  downloadFile(fileUrl:string){
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'filename.ext';
    link.click();
    URL.revokeObjectURL(fileUrl);
  }

  resetFolderModal(){
    this.isSubmitted = false;
    this.saveFolderForm.patchValue({
      folderName: ""
    });
  }

    resetFilesModal() {
      this.fileCount = 1;
      this.isSubmitted = false;
      clearInterval(this.filesModalInterval);
      this.saveFileViewModel.files = [];
      this.progressBarValue = 0;
    }
  
    openSearch(){
        this.isOpenSearch = true;
    }

    closeSearch(){
        this.isOpenSearch = false;
    }
 
    openSidebar(){
      OpenSideBar.next({isOpenSideBar:true})  
    }

    sendToGroup(){
       var comment: any[] = this.fileComments;
       this.InitializeCommentViewModel();
       this.commentViewModel.userId = this.sender.id;
       this.commentViewModel.groupName = this.fileId + "_group";
       this.commentViewModel.content = this.messageToGroup;
       this.commentViewModel.userAvatar = this.sender.avatar;
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
  
      InitializeCommentViewModel(){
        this.commentViewModel = {
          id:'',
          userId: '',
          content:'',
          groupName:'',
          userAvatar:'',
          createdOn:new Date(),
          userName:''
         };
      }

    @HostListener('scroll', ['$event'])
    scrollHandler(event: any) {
     const element = event.target;
     if (element.scrollTop === 0) {
        if(!this.commentsScrolled && this.scrollCommentsResponseCount != 0){
            this.commentsScrolled = true;
            this.commentsLoadingIcon = true;
            this.fileCommentsPageNumber++;
            this.getNextComments();
            }
     }
   }

   getNextComments() {
    this._chatService.getComments(this.fileId,this.fileCommentsPageNumber).subscribe((response) => {
      this.fileComments = response.concat(this.fileComments);
      this.cd.detectChanges();
      this.commentsLoadingIcon = false;
      this.scrollCommentsResponseCount = response.length; 
      this.commentsScrolled = false;
      const chatList = this.groupChatList.nativeElement;
      const chatListHeight = chatList.scrollHeight;
      if(response.length != 0){
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

  commentResponse(){
    commentResponse.subscribe(response => {
      var comment: any[] = this.fileComments;
      var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar,createdOn:response.createdOn,userName:response.userName};
      comment.push(commentObj);
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
    });
  }

  back(){
   this.isOpenCommentsSection = false;
   if(this.isFirstPage){
    window.history.back();
   }
   else{
    this.folderLocation;
    var index = this.folderLocation.lastIndexOf("/");
    this.folderLocation = this.folderLocation.slice(0, index);

    if(this.folderLocation == Constant.FileStorage){
        this.loadingIcon = true;
        this.getFolders();
        this.getFiles();
        this.isFirstPage = true;
    }
    else{
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

  FoldersAndFilesSearch(value:string){
    this.foldersPageNumber = 1;
    if(this.searchString.length >2 || this.searchString == ""){
      if(this.isFirstPage){
      this._fileStorageService.getFolders(this.parentId,this.searchString).subscribe((response: any) => {
        this.folders = response;
        this.getFoldersSelectedPage();
        this.totalFolderRecords = this.folders.length;
        this.isFoldersEmpty = false;
        this.checkFoldersAndFilesExist()
        });

        this._fileStorageService.getFiles(this.parentId,this.searchString).subscribe((response: any) => {
          this.files = response;
          this.getFilesSelectedPage();
          this.totalFileRecords = this.files.length;
          this.isFilesEmpty = false;
          this.checkFoldersAndFilesExist()
          });
        }
        else{
            this._fileStorageService.getNestedFolders(this.folderId,this.searchString).subscribe((response: any) => {
              this.folders = response.folders;
              this.files = response.files;
              this.loadingIcon = false;
              this.isDataLoaded = true;
            });
          }
    }
  }

  deleteFolder(folderId:string){
    this.loadingIcon = true;
    this._fileStorageService.deleteFolder(folderId).subscribe((response: any) => {
      this.loadingIcon = false;
      if(response.result == Constant.FolderCantDeleted){
        this.messageService.add({severity: 'info',summary: 'Info',life: 3000,detail: 'You cant delete folder without deleting the folders/files under it',});
      }
      else{
        this.folders = this.folders.filter((x: { id: any; }) => x.id !== folderId);
        this.folderRecords = this.folderRecords.filter((x: { id: any; }) => x.id !== folderId);
        this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Folder deleted successfully',});
      }
    });
  }

  deleteFile(fileId:string){
    this._fileStorageService.deleteFile(fileId).subscribe((response: any) => {
      this.files = this.files.filter((x: { id: any; }) => x.id !== fileId);
      this.fileRecords = this.fileRecords.filter((x: { id: any; }) => x.id !== fileId);
      this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'File deleted successfully',});
    });
  }

}
