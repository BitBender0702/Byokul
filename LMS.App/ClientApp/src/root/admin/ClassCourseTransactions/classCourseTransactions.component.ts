import { Component, OnInit,Injector, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { RegisteredCourses } from 'src/root/interfaces/admin/registeredCourses';
import { Table } from 'primeng/table';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { IyizicoService } from 'src/root/service/iyizico.service';
import { Constant } from 'src/root/interfaces/constant';
import { AuthService } from 'src/root/service/auth.service';
import { SchoolClassCourseEnum } from 'src/root/Enums/SchoolClassCourseEnum';
import * as XLSX from 'xlsx';

@Component({
  selector: 'school-Transactions',
  templateUrl: './classCourseTransactions.component.html',
  styleUrls: ['classCourseTransactions.component.css'],
  providers: [MessageService]

})
export class ClassCourseTransactionsComponent extends MultilingualComponent implements OnInit,OnDestroy {

  private _adminService;
  private _iyizicoService;
  private _authService;
  isSubmitted: boolean = false;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  cloned!:any;
  classCourseTransactions: any;
  @ViewChild('dt') table!: Table;
  gender!:string;
  refundPaymentId:string = "";
  changeLanguageSubscription!:Subscription;
  


  constructor(injector: Injector,authService: AuthService,public messageService:MessageService,private fb: FormBuilder,private http: HttpClient,adminService: AdminService,iyizicoService:IyizicoService) {
    super(injector);
    this._adminService = adminService;
    this._iyizicoService = iyizicoService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this._authService.loginState$.next(false);
    this._authService.loginAdminState$.next(true);
    this.loadingIcon = true;
    this.gender = localStorage.getItem("gender")??'';
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
    
    this._adminService.getAllClassCourseTransactions().subscribe((response) => {
        this.classCourseTransactions = response;
        this.cloned = response.slice(0);
        this.loadingIcon = false;
        this.isDataLoaded = true;
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


      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      openAdminSideBar(){
        OpenAdminSideBar.next({isOpenSideBar:true})
      }

      resetSorting(): void {
        this.table.reset();
        this.classCourseTransactions = this.cloned.slice(0);
      }

      getRefundPaymentId(paymentId: string) {
        this.refundPaymentId = paymentId;
      }

      reFundPayment(){
        this._iyizicoService.refundPayment(this.refundPaymentId,SchoolClassCourseEnum.Class).subscribe((response: any) => {
        if(response.errorMessage == Constant.Success){
          var message = "Refunded successfully"
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: message });
        }
        else{
          this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: response.errorMessage });
        }
        this.ngOnInit();
        });
      }

      exportToExcel(table: Table) {
        const filteredData = table.filteredValue || table.value;        
        const flattenedData = filteredData.map(item => ({
          UserId: item.user.id,
          UserName: item.user.firstName + " " + item.user.lastName,
          SchoolName: item.class != null ? item.class.school.schoolName : item.course.school.schoolName,
          ClassName: item.class?.className,
          CourseName: item.course?.courseName,
          Amount: item.amount,
          ConversationId: item.conversationId,
          PaymentId: item.paymentId,
          PaymentOn: item.createdOn,
          IsRefund: item.isRefund
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const fileName = 'ClassAndCourseTransactions.xlsx';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      }
    }
    
  


   

