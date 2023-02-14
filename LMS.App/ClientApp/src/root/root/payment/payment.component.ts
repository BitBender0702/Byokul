import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
  })

  export class PaymentComponent {
    paymentDetails:any;
    paymentForm!:FormGroup;
    isSubmitted: boolean = false;


    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
      this.InitializePaymentForm();

    }

    InitializePaymentForm(){
        this.paymentForm = this.fb.group({
            paymentMethod: this.fb.control(''),
            cardNumber: this.fb.control(''),
            expiresOn: this.fb.control(''),
            securityCode: this.fb.control(''),
            firstName: this.fb.control(''),
            lastName: this.fb.control('')
          });
    }

    

    addPayment(){

    }
}
