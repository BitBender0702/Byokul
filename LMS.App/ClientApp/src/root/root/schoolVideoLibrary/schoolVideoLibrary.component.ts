import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subject, Subscription } from 'rxjs';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { UploadVideo } from 'src/root/interfaces/post/uploadVideo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { postProgressNotification, postUploadOnBlob } from '../root.component';
import { Constant } from 'src/root/interfaces/constant';
import { VideoLibraryService } from 'src/root/service/videoLibrary.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SchoolService } from 'src/root/service/school.service';
import { CreatePostComponent } from '../createPost/createPost.component';

export const addVideoInLibraryResponse = new Subject<{addVideoInLibraryResponse:any;availableSpace:number}>();


@Component({
    selector: 'fileStorage',
    templateUrl: './schoolVideoLibrary.component.html',
    styleUrls: ['./schoolVideoLibrary.component.css'],
    providers: [MessageService]
  })

export class SchoolVideoLibraryComponent extends MultilingualComponent implements OnInit, OnDestroy {
  private _videoLibraryService;
  private _schoolService;
  selectedLanguage:any;
  isDataLoaded:boolean = false;
  uploadVideo:any;
  videoThumbnail:any;
  videoObject!: UploadVideo;
  isError:boolean = false;
  isSubmitted:boolean = false;
  loadingIcon:boolean = false;
  videoLibraryForm!: FormGroup;
  videoToUpload = new FormData();
  schoolId:string = "";
  libraryVideoes:any;
  totalVideoRecords!:number;
  videosPageNumber:number = 1;
  videoItemsPerPage: number = 10;
  videoRecords:any;
  deletedVideoId:string = "";
  videoFile:any;
  changeLanguageSubscription!:Subscription;
  selectedSchoolForStream:any;
  selectedClassForStream:any;
  videoAddedResponseSubscription!:Subscription;
  classList:any;
  isSchoolSelected:boolean = true;
  videoThumbnails:any[] = [];
  videos:any[] = [];
  selectedVideo:any;
  availableSpace:number = 0;
  isVideoSelected:boolean = false;

  
  @ViewChild('closeUploadVideoModal') closeUploadVideoModal!: ElementRef;
  @ViewChild('closeStreamVideoModal') closeStreamVideoModal!: ElementRef;




  constructor(injector: Injector,private fb: FormBuilder,private translateService: TranslateService,private activatedRoute: ActivatedRoute,private bsModalService: BsModalService,videoLibraryService:VideoLibraryService,schoolService:SchoolService,public messageService:MessageService) { 
    super(injector);
    this._videoLibraryService = videoLibraryService;
    this._schoolService = schoolService;
  }

  ngOnInit(): void {
    this.schoolId = this.activatedRoute.snapshot.paramMap.get('schoolId')??'';
    this.selectedSchoolForStream = this.schoolId;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage?? '');
    

    this._videoLibraryService.getSchoolLibraryVideos(this.schoolId).subscribe((response) => {
      this.libraryVideoes = response;
      this.totalVideoRecords = this.libraryVideoes.length;
      this.getFilesSelectedPage();
    });

    this._schoolService.getSchool(this.schoolId).subscribe((response: any) => {
      this.availableSpace = response.availableStorageSpace;
    });
    

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage?? '');
      })
    }

    this.videoLibraryForm = this.fb.group({
      title: this.fb.control('', [Validators.required])
    });

    if(!this.videoAddedResponseSubscription){
      this.videoAddedResponseSubscription = addVideoInLibraryResponse.subscribe(result => {
        this.isSubmitted = false;
        this.loadingIcon = false;
        this.libraryVideoes.unshift(result.addVideoInLibraryResponse);
        this.getFilesSelectedPage();
        this.totalVideoRecords = this.libraryVideoes.length;
        this.availableSpace = this.availableSpace - result.availableSpace;
        this.availableSpace = parseFloat(this.availableSpace.toFixed(2));
        // this.saveFileViewModel.files = [];
        // this.filesToUpload.set('files', '');
        this.closeUploadVideoModal.nativeElement.click();
      });
      }

  }

  ngOnDestroy(): void {
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
  }

  getFilesSelectedPage(event?:any){
    if(event == undefined){
      var startIndex = ((this.videosPageNumber) - 1) * this.videoItemsPerPage;
    }
    else{
      var startIndex = ((event.page + 1) - 1) * this.videoItemsPerPage;
    }
    const endIndex = startIndex + this.videoItemsPerPage;
    this.videoRecords = this.libraryVideoes.slice(startIndex, endIndex);
  }

  back(): void {
    window.history.back();
  }

  openSidebar(){
    OpenSideBar.next({isOpenSideBar:true})  
  }

  handleVideoInput(event: any) {
    this.videoFile = event.target.files[0];
    this.videos.push(event.target.files[0]);
    // this.uploadVideo = event.target.files[0];
      // this.videos.push(selectedFiles[i]);
      this.initializeVideoObject();
      const file = event.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      this.getVideoThumbnail(videoUrl, file.name, (thumbnailUrl) => {
        this.videoObject.videoUrl = thumbnailUrl;
        this.videoObject.name = file.name;
        this.videoObject.type = file.type;
        // this.uploadVideo.push(this.videoObject);
        this.uploadVideo = this.videoObject;
        this.initializeVideoObject();
      });

      this.isVideoSelected = true;
  }

  getVideoThumbnail(videoUrl: string, fileName: string, callback: (thumbnailUrl: string) => void) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.currentTime = 4;
    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      video.addEventListener('seeked', () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL();

        this.saveCanvasToFile(canvas, fileName);
        callback(thumbnailUrl);
      });
      video.currentTime = 4;
    });
  }

  async saveCanvasToFile(canvas: HTMLCanvasElement, fileName: string) {
    const blob = await this.canvasToBlob(canvas);

    let lastSlashIndex = blob.type.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      var thumbnailType = blob.type.substring(lastSlashIndex + 1);
    }


    let lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      fileName = fileName.substring(0, lastDotIndex + 1);
    }

    fileName = fileName + thumbnailType;

    const file = new File([blob], fileName, { type: blob.type });
    this.videoThumbnails.push(file);
    this.videoThumbnail = file;
  }

  canvasToBlob(canvas: HTMLCanvasElement): Promise<any> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  initializeVideoObject() {
    this.videoObject = {
      videoUrl: '',
      name: '',
      type: ''
    };

  }

  removeUploadVideo(video:any){
    this.uploadVideo = null;
    this.isVideoSelected = false;
  }

  saveVideo(){
    this.isSubmitted = true;
    if (!this.videoLibraryForm.valid) {
      return;
    }
    if(this.uploadVideo == null || this.uploadVideo == undefined){
     this.isError = true;
    }

    this.loadingIcon = true;
    setTimeout(() => {
      this.loadingIcon = false;
      this.closeUploadVideoModal.nativeElement.click();
      postProgressNotification.next({ from: Constant.VideoLibrary });
    }, 3000);

    var videoLibrary = this.videoLibraryForm.value;
    this.videoToUpload.append('fileName', videoLibrary.title);
    this.videoToUpload.append('schoolId', this.schoolId);

    const combinedFiles = [...this.videos, ... this.videoThumbnails];
    postUploadOnBlob.next({ postToUpload: this.videoToUpload, combineFiles: combinedFiles, videos: this.videos, images: null, attachment: null, type: 5, reel: null, uploadedUrls: [], videoThumbnails: this.videoThumbnails , schoolId:this.schoolId});


  }

  getDeletedVideoId(deletedVideoId:string){
   this.deletedVideoId = deletedVideoId;
  }

  deleteFile(){
    this.loadingIcon = true;
    this._videoLibraryService.deleteFile(this.deletedVideoId).subscribe((response: any) => {
      this.libraryVideoes = this.libraryVideoes.filter((x: { id: any; }) => x.id !== this.deletedVideoId);
      this.videoRecords = this.videoRecords.filter((x: { id: any; }) => x.id !== this.deletedVideoId);
      this.loadingIcon = false;
      const translatedSummary = this.translateService.instant('Success');
      const translatedMessage = this.translateService.instant('VideoDeletedSuccessfully');
      this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage});
    });
  }

  getSchoolClassList(){
    this.isSchoolSelected = false;
    if(this.classList == undefined){
    this._schoolService.getClassListBySchoolId(this.schoolId).subscribe((response: any) => {
      this.classList = response;
    });
  }
  }

  schoolSelected(){
    this.isSchoolSelected = true;
  }

  streamVideo(){
    this.closeStreamVideoModal.nativeElement.click();
    if(this.isSchoolSelected){
      var schoolId = this.selectedSchoolForStream;
      this.streamFromSchool(schoolId);
    }
    else{
      var classId = this.selectedClassForStream;
      this.streamFromClass(classId);
    }

  }

  streamFromSchool(schoolId:string){
    var initialState = {
      schoolId: schoolId,
      from: "school",
      isLiveTabOpen: true,
      selectedVideoFromLibrary: this.selectedVideo
    };
    this.bsModalService.show(CreatePostComponent, { initialState });
  }

  streamFromClass(classId:string){
    var initialState = {
      classId: classId,
      from: "class",
      isLiveTabOpen: true,
      selectedVideoFromLibrary: this.selectedVideo
    };
    this.bsModalService.show(CreatePostComponent, { initialState });
  }

  getClassId(event:any){
    this.selectedClassForStream = event.value;
  }

  getSelectedVideo(file:any){
   this.selectedVideo = file;
   this.selectedSchoolForStream = this.schoolId;
   this.isSchoolSelected = true;
  }


  resetUploadFileModal(){
    this.isSubmitted = false;
    this.videoLibraryForm.patchValue({
      title: ""
    });

    this.uploadVideo = "";
    this.videos = [];
    this.videoThumbnails = [];
    this.isVideoSelected = false;

    // this.videoLibraryForm.reset(); 
    this.videoToUpload = new FormData();
  }

  

}