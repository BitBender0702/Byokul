import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable, Subject, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { PayoutViewModel } from "../interfaces/payment/payoutViewModel";
import { TransactionParamViewModel } from "../interfaces/payment/transactionParamViewModel";

@Injectable({providedIn: 'root'})

export class PaymentService{

  public webhookSubject = new Subject<any>();

    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    buyClassCourse(paymentDetails:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/iyizico/buySchoolClassCourse`,paymentDetails, {headers: this.headers});
    }

    transactionDetails(transactionParamViewModel: TransactionParamViewModel):Observable<any>{
      return this.http.post(`${this.apiUrl}/iyizico/ownedSchoolTransactionDetails`,transactionParamViewModel, {headers: this.headers});
    }

    transactionDashboardDetails():Observable<any>{
      return this.http.get(`${this.apiUrl}/iyizico/getTransactionDashboardDetails`, {headers: this.headers});
    }

    withdrawDetails(transactionParamViewModel: TransactionParamViewModel):Observable<any>{
      return this.http.post(`${this.apiUrl}/stripe/withdrawDetails`,transactionParamViewModel, {headers: this.headers});
    }

    submerchantTransactionDetails(transactionParamViewModel: TransactionParamViewModel):Observable<any>{
      return this.http.post(`${this.apiUrl}/iyizico/getSubmerchantTransactionDetails`,transactionParamViewModel, {headers: this.headers});
    }

    classCourseTransactionDetails(transactionParamViewModel: TransactionParamViewModel):Observable<any>{
      return this.http.post(`${this.apiUrl}/iyizico/classCourseTransactionDetails`,transactionParamViewModel, {headers: this.headers});
    }

    allTransactionDetails(transactionParamViewModel: TransactionParamViewModel):Observable<any>{
      return this.http.post(`${this.apiUrl}/iyizico/allTransactionDetails`,transactionParamViewModel, {headers: this.headers});
    }

    payout(payoutViewModel:PayoutViewModel): Observable<any> {
      return this.http.post(`${this.apiUrl}/stripe/payout`,payoutViewModel, {headers: this.headers});
    }

    removeCard(cardUserKey:string,cardToken:string): Observable<any> {
      let queryParams = new HttpParams().append("cardUserKey",cardUserKey).append("cardToken",cardToken);
      return this.http.post(`${this.apiUrl}/iyizico/removeCard`,null, {params:queryParams,headers: this.headers});
  }

}
