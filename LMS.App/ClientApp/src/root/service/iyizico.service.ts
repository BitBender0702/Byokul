import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class IyizicoService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    getSubscriptionPlans(): Observable<any> {
        return this.http.post(`${this.apiUrl}/iyizico/getSubscriptionPlans`,{headers: this.headers});
    }

    getUserSavedCardsList(): Observable<any> {
        return this.http.get(`${this.apiUrl}/iyizico/getUserSavedCards`,{headers: this.headers});
    }

    cancelSubscription(schoolId:string): Observable<any> {
        return this.http.post(`${this.apiUrl}/iyizico/cancelSubscription` + '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    renewSubscription(schoolId:string): Observable<any> {
        return this.http.post(`${this.apiUrl}/iyizico/renewSubscription`+ '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    refundPayment(paymentId:string,from:number): Observable<any> {
        let queryParams = new HttpParams().append("paymentId",paymentId).append("type",from);
        return this.http.post(`${this.apiUrl}/iyizico/refundPayment`,null, {params:queryParams,headers: this.headers});
    }

}