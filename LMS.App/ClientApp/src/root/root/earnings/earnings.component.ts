import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { PaymentService } from 'src/root/service/payment.service';
import { DatePipe } from '@angular/common';
import { PayoutViewModel } from 'src/root/interfaces/payment/payoutViewModel';
import { UserService } from 'src/root/service/user.service';
import { TransactionParamViewModel } from 'src/root/interfaces/payment/transactionParamViewModel';
import { Subscription } from 'rxjs';
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';

@Component({
    selector: 'earnings',
    templateUrl: './earnings.component.html',
    styleUrls: ['./earnings.component.css']
  })

export class EarningsComponent extends MultilingualComponent implements OnInit, OnDestroy {

    isOpenSidebar:boolean = false;
    isOpenSearch:boolean = false;
    private _paymentService;
    private _userService;
    transactionDetails:any;
    withdrawDetails:any;
    classCourseDetails:any;
    allTransactionDetails:any;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    isSubmitted: boolean = false;
    searchString:string = "";
    pageNumber:number = 1;
    scrolled:boolean = false;
    transactionsResponseCount:number = 1;
    withdrawScrolled:boolean = false;
    classCourseScrolled:boolean = false;
    withdrawResponseCount:number = 1;
    withdrawPageNumber:number = 1;
    allScrolled:boolean = false;
    allTransactionPageNumber:number = 1;
    classCoursePageNumber:number = 1;
    allTransactionsResponseCount:number = 1;
    classCourseResponseCount:number = 1;
    scrollLoadingIcon: boolean = false;
    currentDate!:string;
    filterDateForm!:FormGroup;
    payoutForm!:FormGroup;
    startDateObject!: Date;
    endDateObject!: Date;
    formattedStartDate!: string;
    formattedEndDate!: string;
    payoutViewModel!:PayoutViewModel
    countries!:any;
    isOpenOwnedSchoolTab!:boolean;
    isOpenClassCourseTab!:boolean;
    isOpenWithdrawTab!:boolean;
    isOpenAllTab!:boolean;
    isApplieDateFilter!:boolean;
    maxDate:Date = new Date();
    gender!:string;
    hamburgerCountSubscription!: Subscription;
    hamburgerCount:number = 0;
    changeLanguageSubscription!: Subscription;
    transactionParamViewModel!: TransactionParamViewModel;
    @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
    @ViewChild('filterBtn') filterBtn!: ElementRef;


    constructor(injector: Injector,private datePipe: DatePipe,userService:UserService,paymentService:PaymentService,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,private cd: ChangeDetectorRef) { 
      super(injector);
      this._userService = userService;
      this._paymentService = paymentService;
    }
  
    ngOnInit(): void {
      debugger
      this.loadingIcon = true;
      this.isOpenOwnedSchoolTab = true;
      this.gender = localStorage.getItem("gender")??'';
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.transactionParamViewModel = {
        pageNumber:0,
        searchString:null,
        startDate : null,
        endDate: null
       }

      this.transactionParamViewModel.pageNumber = this.pageNumber;
      this.initialTransactionDetails(this.transactionParamViewModel);
      this.currentDate = this.getCurrentDate();

      this.filterDateForm = this.fb.group({
        startDate: this.fb.control(new Date(),[Validators.required]),
        endDate: this.fb.control(new Date(),[Validators.required]),
      }, {validator: this.dateLessThan('startDate', 'endDate',this.currentDate)});

      this.payoutForm = this.fb.group({
        amount: this.fb.control('',[Validators.required]),
        accountNumber: this.fb.control('',[Validators.required]),
        routingNumber: this.fb.control('',[Validators.required]),
        accountHolderName: this.fb.control('',[Validators.required]),
        accountHolderType: this.fb.control('',[Validators.required]),
        country: this.fb.control('',[Validators.required])
      });

      this.payoutViewModel = {
        amount: '',
        accountNumber: '',
        routingNumber:'',
        accountHolderName: '',
        accountHolderType: 0,
        country: ''
       };

      document.addEventListener('click', this.handleDocumentClick);

      if(!this.changeLanguageSubscription){
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
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownMenu.nativeElement.contains(event.target) && !this.filterBtn.nativeElement.contains(event.target)) {
      this.dropdownMenu.nativeElement.style.display = 'none';
      this.cd.detectChanges();
    }
  }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      if (this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription.unsubscribe();
      }
    }

    initialTransactionDetails(transactionParamViewModel:TransactionParamViewModel){
      debugger
      this._paymentService.transactionDetails(transactionParamViewModel).subscribe((response) => {
        debugger
        this.transactionDetails = response;
        this.isDataLoaded = true;
        this.loadingIcon = false;
        this.isSubmitted = false;
      });
    }

    initialWithdrawDetails(transactionParamViewModel:TransactionParamViewModel){
      this._paymentService.withdrawDetails(transactionParamViewModel).subscribe((response) => {
        this.withdrawDetails = response;
        this.loadingIcon = false;
        this.isSubmitted = false;
      });
    }

    initialClassCourseDetails(transactionParamViewModel:TransactionParamViewModel){
      this._paymentService.classCourseTransactionDetails(transactionParamViewModel).subscribe((response) => {
        this.classCourseDetails = response.classCourseTransactions;
        this.loadingIcon = false;
        this.isSubmitted = false;
      });
    }

    initialAllTransactionDetails(transactionParamViewModel:TransactionParamViewModel){
      this._paymentService.allTransactionDetails(this.transactionParamViewModel).subscribe((response) => {
        this.allTransactionDetails = response;
        this.loadingIcon = false;
        this.isSubmitted = false;
      });
    }

    getCurrentDate(){
      var today = new Date();
        var dd = String(today. getDate()). padStart(2, '0');
        var mm = String(today. getMonth() + 1). padStart(2, '0');
        var yyyy = today. getFullYear();
      ​  var currentDate = yyyy + '-' + mm + '-' + dd;
        return currentDate;
    }

    dateLessThan(from: string, to: string, currentDate:string) {
      return (group: FormGroup): {[key: string]: any} => {
       const startDateString= group.controls[from].value;
       const endDateString = group.controls[to].value;
       this.startDateObject = new Date(startDateString);
       this.formattedStartDate = this.datePipe?.transform(this.startDateObject, 'yyyy-MM-dd')??'';
 
       this.endDateObject = new Date(endDateString);
       this.formattedEndDate = this.datePipe?.transform(this.endDateObject, 'yyyy-MM-dd')??'';

       
       if (this.formattedStartDate > this.formattedEndDate || this.formattedStartDate > currentDate || this.formattedEndDate > currentDate 
            || this.formattedStartDate == this.formattedEndDate) {
         return {
           dates: `Please enter valid date`
         };
       }
       return {};
      }
    }
    

    handleDocumentClick = (event:any) => {
      const clickedInside = this.dropdownMenu.nativeElement.contains(event.target);
      if (!clickedInside) {
      }
    }

    showFilterDropdown(){
      this.filterDateForm.get('startDate')?.setValue(new Date());  
      this.filterDateForm.get('endDate')?.setValue(new Date());  
      this.filterDateForm.setErrors(null);
      var display = this.dropdownMenu.nativeElement.style.display;
      if(display == ""){
        display = "none";
      }

const position = (display === 'none') ? 'absolute' : 'static';
const right = (display === 'none') ? '40px' : 'auto';
const top = (display === 'none') ? '100%' : 'auto';

this.dropdownMenu.nativeElement.style.position = position;
this.dropdownMenu.nativeElement.style.right = right;
this.dropdownMenu.nativeElement.style.top = top;
this.dropdownMenu.nativeElement.style.display = (display === 'none') ? 'block' : 'none';
    }

    hideFilterDropdown(){
      this.dropdownMenu.nativeElement.style.display = 'none';
    }
    

    Search(){
      this.pageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        this.transactionParamViewModel.pageNumber = this.pageNumber;
        this.transactionParamViewModel.searchString = this.searchString;
        if(this.isOpenOwnedSchoolTab){
          this._paymentService.transactionDetails(this.transactionParamViewModel).subscribe((response) => {
            this.transactionDetails = response;
          });
        }

        if(this.isOpenAllTab){
          this._paymentService.allTransactionDetails(this.transactionParamViewModel).subscribe((response) => {
            this.allTransactionDetails = response;
          });
        }
        if(this.isOpenWithdrawTab){
          this._paymentService.withdrawDetails(this.transactionParamViewModel).subscribe((response) => {
            this.withdrawDetails = response;
          });
        }

        if(this.isOpenClassCourseTab){
          this._paymentService.classCourseTransactionDetails(this.transactionParamViewModel).subscribe((response) => {
            this.classCourseDetails = response.classCourseTransactions;
          });
        }
      }
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
      const scrollPosition = window.pageYOffset;
      const windowSize = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      
      if (scrollPosition >= bodyHeight - windowSize) {
        if(this.isOpenOwnedSchoolTab){
          if(!this.scrolled && this.transactionsResponseCount != 0){
          this.scrolled = true;
          this.scrollLoadingIcon = true;
          this.pageNumber++;
          this.getTransactionDetails();
        }
       }

       if(this.isOpenWithdrawTab){
        if(!this.withdrawScrolled && this.withdrawResponseCount != 0){
          this.withdrawScrolled = true;
          this.scrollLoadingIcon = true;
          this.withdrawPageNumber++;
          this.getWithdrawDetails();
        }
       }

       if(this.isOpenAllTab){
        if(!this.allScrolled && this.allTransactionsResponseCount != 0){
          this.allScrolled = true;
          this.scrollLoadingIcon = true;
          this.allTransactionPageNumber++;
          this.getAllTransactionDetails();
        }
       }
      }

      if(this.isOpenClassCourseTab){
        if(!this.classCourseScrolled && this.classCourseResponseCount != 0){
          this.classCourseScrolled = true;
          this.scrollLoadingIcon = true;
          this.classCoursePageNumber++;
          this.getClassCourseDetails();
        }
       }
  }

  getTransactionDetails(){
    this.transactionParamViewModel.pageNumber = this.pageNumber;
    this.transactionParamViewModel.searchString = this.searchString;
    this._paymentService.transactionDetails(this.transactionParamViewModel).subscribe((response) => {
      this.transactionDetails.transactions =[...this.transactionDetails.transactions, ...response.transactions];
      this.scrollLoadingIcon = false;
      this.transactionsResponseCount = response.length; 
      this.scrolled = false;
    });
  }

  getWithdrawDetails(){
    this.transactionParamViewModel.pageNumber = this.withdrawPageNumber;
    this.transactionParamViewModel.searchString = this.searchString;
    this._paymentService.withdrawDetails(this.transactionParamViewModel).subscribe((response) => {
      this.withdrawDetails.transactions =[...this.withdrawDetails.transactions, ...response.transactions];
      this.scrollLoadingIcon = false;
      this.withdrawResponseCount = response.length; 
      this.withdrawScrolled = false;
    });
  }

  getAllTransactionDetails(){
    this.transactionParamViewModel.pageNumber = this.allTransactionPageNumber;
    this.transactionParamViewModel.searchString = this.searchString;
    this._paymentService.allTransactionDetails(this.transactionParamViewModel).subscribe((response) => {
      this.allTransactionDetails.transactions =[...this.allTransactionDetails.transactions, ...response.transactions];
      this.scrollLoadingIcon = false;
      this.allTransactionsResponseCount = response.length; 
      this.allScrolled = false;
    });
  }

  getClassCourseDetails(){
    debugger
    this.transactionParamViewModel.pageNumber = this.classCoursePageNumber;
    this.transactionParamViewModel.searchString = this.searchString;
    this._paymentService.classCourseTransactionDetails(this.transactionParamViewModel).subscribe((response) => {
      debugger
      this.classCourseDetails.transactions =[...this.classCourseDetails, ...response.classCourseTransactions];
      this.scrollLoadingIcon = false;
      this.allTransactionsResponseCount = response.length; 
      this.allScrolled = false;
    });
  }

  applyDateFilter(){
    this.isSubmitted=true;
    if (!this.filterDateForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.isApplieDateFilter = true;
    var dates = this.filterDateForm.value;
    this.dropdownMenu.nativeElement.style.display = 'none';
    this.transactionParamViewModel.searchString = this.searchString;
    this.transactionParamViewModel.startDate = new Date(dates.startDate.getTime() - dates.startDate.getTimezoneOffset() * 60000);
    this.transactionParamViewModel.endDate = new Date(dates.endDate.getTime() - dates.endDate.getTimezoneOffset() * 60000);
   if(this.isOpenOwnedSchoolTab){
    this.transactionParamViewModel.pageNumber = 1;
    this.initialTransactionDetails(this.transactionParamViewModel);
   }

   if(this.isOpenWithdrawTab){
    this.transactionParamViewModel.pageNumber = 1;
    this.initialWithdrawDetails(this.transactionParamViewModel);
   }
   if(this.isOpenClassCourseTab){
    this.transactionParamViewModel.pageNumber = 1;
    this.initialClassCourseDetails(this.transactionParamViewModel);
   }

   if(this.isOpenAllTab){
    this.transactionParamViewModel.pageNumber = 1;
    this.initialAllTransactionDetails(this.transactionParamViewModel);
   }
  }

  removeDateFilter(){
    this.loadingIcon = true;
    this.isApplieDateFilter = false;
    this.transactionParamViewModel.pageNumber = 1;
    this.transactionParamViewModel.searchString = this.searchString;
    this.transactionParamViewModel.startDate = null;
    this.transactionParamViewModel.endDate = null;
    if(this.isOpenOwnedSchoolTab){
      this.initialTransactionDetails(this.transactionParamViewModel);
    }
    if(this.isOpenWithdrawTab){
      this.initialWithdrawDetails(this.transactionParamViewModel);
    }
    if(this.isOpenAllTab){
      this.initialAllTransactionDetails(this.transactionParamViewModel);
    }
    if(this.isOpenClassCourseTab){
      this.initialClassCourseDetails(this.transactionParamViewModel);
    }
    this.filterDateForm.get('startDate')?.setValue(new Date());
    this.filterDateForm.get('endDate')?.setValue(new Date());
    this.dropdownMenu.nativeElement.style.display = 'none';
  }

    back(): void {
      window.history.back();
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
  
    resetPayoutModal(){
      this._userService.getCountryList().subscribe((response) => {
        this.countries = response;
      });    
    }

    payout(){
      this.isSubmitted = true;
      if (!this.payoutForm.valid) {
        return;
      }
      var payout = this.payoutForm.value;
      this.payoutViewModel.amount = payout.amount;
      this.payoutViewModel.accountNumber = payout.accountNumber;
      this.payoutViewModel.routingNumber = payout.routingNumber;
      this.payoutViewModel.accountHolderName = payout.accountHolderName;
      this.payoutViewModel.accountHolderType = Number(payout.accountHolderType);
      this.payoutViewModel.country = payout.country;

      this._paymentService.payout(this.payoutViewModel).subscribe((response) => {
        this.isSubmitted = false;
      });

    }

    isOwnedSchoolTab(){
      this.isOpenOwnedSchoolTab = true;
      this.isOpenAllTab = false;
      this.isOpenWithdrawTab = false;
      this.isOpenClassCourseTab = false;

      this.loadingIcon = true;
      this.transactionParamViewModel.pageNumber = 1;
      var dates = this.filterDateForm.value;
      var startDate = new Date(dates.startDate.getTime() - dates.startDate.getTimezoneOffset() * 60000);
      var endDate = new Date(dates.endDate.getTime() - dates.endDate.getTimezoneOffset() * 60000);
      if(startDate.getTime() != endDate.getTime()){
        this.transactionDetails.startDate = startDate;
        this.transactionDetails.endDate = endDate;
      }
      this.initialTransactionDetails(this.transactionParamViewModel);
    }

    isClassCourseTab(){
      debugger
      this.isOpenOwnedSchoolTab = false;
      this.isOpenAllTab = false;
      this.isOpenWithdrawTab = false;
      this.isOpenClassCourseTab = true;

      this.loadingIcon = true;
      this.transactionParamViewModel.pageNumber = 1;
      var dates = this.filterDateForm.value;
      var startDate = new Date(dates.startDate.getTime() - dates.startDate.getTimezoneOffset() * 60000);
      var endDate = new Date(dates.endDate.getTime() - dates.endDate.getTimezoneOffset() * 60000);
      if(startDate.getTime() != endDate.getTime()){
        this.transactionDetails.startDate = startDate;
        this.transactionDetails.endDate = endDate;
      }
      this.initialClassCourseDetails(this.transactionParamViewModel);
    }

    isWithdarwTab(){
      this.loadingIcon = true;
      this.isOpenOwnedSchoolTab = false;
      this.isOpenAllTab = false;
      this.isOpenWithdrawTab = true;
      this.isOpenClassCourseTab = false;
      this.transactionParamViewModel.pageNumber = 1;
      var dates = this.filterDateForm.value;
      var startDate = new Date(dates.startDate.getTime() - dates.startDate.getTimezoneOffset() * 60000);
      var endDate = new Date(dates.endDate.getTime() - dates.endDate.getTimezoneOffset() * 60000);
      if(startDate.getTime() != endDate.getTime()){
        this.transactionDetails.startDate = startDate;
        this.transactionDetails.endDate = endDate;
      }
      this.initialWithdrawDetails(this.transactionParamViewModel);
    }

    isAllTab(){
      this.loadingIcon = true;
      this.isOpenOwnedSchoolTab = false;
      this.isOpenAllTab = true;
      this.isOpenWithdrawTab = false;
      this.isOpenClassCourseTab = false;
      this.transactionParamViewModel.pageNumber = 1;
      var dates = this.filterDateForm.value;
      var startDate = new Date(dates.startDate.getTime() - dates.startDate.getTimezoneOffset() * 60000);
      var endDate = new Date(dates.endDate.getTime() - dates.endDate.getTimezoneOffset() * 60000);
      if(startDate.getTime() != endDate.getTime()){
        this.transactionDetails.startDate = startDate;
        this.transactionDetails.endDate = endDate;
      }
      this.initialAllTransactionDetails(this.transactionParamViewModel);
    }
}
