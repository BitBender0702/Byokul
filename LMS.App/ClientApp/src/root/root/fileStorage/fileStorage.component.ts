import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { Constant } from 'src/root/interfaces/constant';
import { SaveFilesViewModel } from 'src/root/interfaces/fileStorage/saveFilesViewModel';
import { ChatService } from 'src/root/service/chatService';
import { FileStorageService } from 'src/root/service/fileStorage';
import { SchoolService } from 'src/root/service/school.service';
import { commentResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'fileStorage',
    templateUrl: './fileStorage.component.html',
    styleUrls: ['./fileStorage.component.css'],
    providers: [MessageService]
  })

export class FileStorageComponent implements OnInit {

    private _fileStorageService;
    private _userService;
    private _signalRService;
    private _chatService;
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
    isFilesEmpty!:boolean;
    isOpenSidebar:boolean = false;
    isOpenSearch:boolean = false;

    @ViewChild('closeFileModal') closeFileModal!: ElementRef;
    @ViewChild('closeFolderModal') closeFolderModal!: ElementRef;
    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,userService:UserService,fileStorageService:FileStorageService,signalRService:SignalrService,chatService:ChatService,public messageService:MessageService,private cd: ChangeDetectorRef) { 
      this._userService = userService; 
      this._fileStorageService = fileStorageService;
      this._signalRService = signalRService;
      this._chatService = chatService;
    }
  
    ngOnInit(): void {
      this.loadingIcon = true;
      this.isFirstPage = true;
      this.parentId = this.activatedRoute.snapshot.paramMap.get('id')??'';

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

    }

    getFolders(){
      this._fileStorageService.getFolders(this.parentId).subscribe((response: any) => {
        this.folders = response;
        this.isFoldersEmpty = false;
        this.checkFoldersAndFilesExist()
        });
    }

    getFiles(){
      this._fileStorageService.getFiles(this.parentId).subscribe((response: any) => {
        this.files = response;
        this.isFilesEmpty = false;
        this.checkFoldersAndFilesExist()
        });
    }

    checkFoldersAndFilesExist(){
        if(!this.isFoldersEmpty && !this.isFilesEmpty){
          this.isDataLoaded = true;
          this.loadingIcon = false;
        }
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
        this.loadingIcon = true;
        this.saveFolderForm.controls.parentId.setValue(this.parentId);
        if(this.parentFolderId == ""){
          this.saveFolderForm.controls.parentFolderId.setValue(null);
        }
        else{
          this.saveFolderForm.controls.parentFolderId.setValue(this.parentFolderId);
        }
        var formValues =this.saveFolderForm.value;
        this._fileStorageService.saveFolder(formValues).subscribe((response: any) => {
          this.closeFoldersModal();
        this.isSubmitted = false;
        this.folders.unshift(response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Language added successfully',
        });
      });
    }

    handleFiles(event: any) {
      this.saveFileViewModel.files.push(event.target.files[0]);
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
    this.loadingIcon = true;
    for (var i = 0; i < this.saveFileViewModel.files.length; i++) {
      this.filesToUpload.append(
        'files',
        this.saveFileViewModel.files[i]
      );
    }

    this.filesToUpload.append('parentId', this.parentId);
      if(this.parentFolderId != ""){
        this.filesToUpload.append('folderId', this.parentFolderId);
      }

    this._fileStorageService.saveFiles(this.filesToUpload).subscribe((response: any) => {
        this.closeFilesModal();
        this.isSubmitted = false;
        this.files = response.concat(this.files);
        this.saveFileViewModel.files = [];
        this.filesToUpload.set('files', '');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          life: 3000,
          detail: 'Files added successfully',
        });
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
    this.folders = null;
    this.files = null;
    this._fileStorageService.getNestedFolders(folderId).subscribe((response: any) => {
      this.folders = response.folders;
      this.files = response.files;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });
  }

  openCommentsSection(fileId:string){
    this.loadingIcon = true;
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

    resetFilesModal() {
      this.isSubmitted = false;
      this.saveFileViewModel.files = [];
    }
  
    openSearch(){
        this.isOpenSearch = true;
    }

    closeSearch(){
        this.isOpenSearch = false;
    }
 
    openSidebar(){
      this.isOpenSidebar = true;
  
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
      this.files = this.previousFiles;
      this.loadingIcon = false;
    }
   }
  }
}
