using Abp.BackgroundJobs;
using Hangfire;
using Iyzipay.Model;
using Iyzipay.Model.V2.Subscription;
using Iyzipay.Model.V2.Transaction;
using Iyzipay.Request;
using Iyzipay.Request.V2;
using Iyzipay.Request.V2.Subscription;
using LMS.Common.Enums;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Stripe;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using LMS.Data.Migrations;
using LMS.Services;
using LMS.Services.Blob;
using LMS.Services.Iyizico;
using LMS.Services.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace LMS.App.Controllers
{
    [Route("iyizico")]
    public class IyzicoController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IIyizicoService _iyizicoService;

        public IyzicoController(UserManager<User> userManager, IIyizicoService iyizicoService)
        {
            _userManager = userManager;
            _iyizicoService = iyizicoService;
        }

        [Route("buySchoolSubscription")]
        [HttpPost]
        public async Task<IActionResult> BuySchoolSubscription([FromBody] BuySchoolSubscriptionViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var schoolId = new Guid();
            await _iyizicoService.BuySchoolSubscription(model, userId, schoolId);

            return Ok();
        }

        [Route("getSubscriptionPlans")]
        [HttpPost]
        public async Task<IActionResult> GetSubscriptionPlans()
        {
            var response = await _iyizicoService.GetSubscriptionPlans();

            return Ok(response);
        }

        [Route("buyClassCourse")]
        [HttpPost]
        public async Task<IActionResult> BuyClassCourseSubscription([FromBody] BuyClassCourseViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.BuyClassCourse(model, userId);
            return Json(response);
        }

        [HttpPost("callback")]
        public IActionResult Callback([FromForm] ThreeDCallbackViewModel callbackModel)
        {
            try
            {
                if (callbackModel.Status == Status.SUCCESS.ToString())
                {
                    Iyzipay.Options options = new Iyzipay.Options
                    {
                        ApiKey = "sandbox-aMqc85z6hayNJmHSoZXAGxdvruaYwkWi",
                        SecretKey = "sandbox-zkMyw4uHeLFDt9CTltscujK6dVk6Piem",
                        BaseUrl = "https://sandbox-api.iyzipay.com"
                    };
                    CreateThreedsPaymentRequest request = new CreateThreedsPaymentRequest();

                    request.ConversationId = callbackModel.ConversationId.ToString();
                    request.PaymentId = callbackModel.PaymentId;

                    if (!string.IsNullOrEmpty(callbackModel.ConversationData))
                    {
                        request.ConversationData = callbackModel.ConversationData;
                    }

                    ThreedsPayment threedsPayment = ThreedsPayment.Create(request, options);

                    if (threedsPayment.Status == Status.SUCCESS.ToString())
                    {
                        _iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                        return base.Content("<div>Payment successful.</div>", "text/html");
                    }
                    if (threedsPayment.Status == Status.FAILURE.ToString())
                    {
                        _iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                        return base.Content("<div>Your payment has failed. Please try again.</div>", "text/html");
                    }



                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Ok();
        }

        [HttpPost("CheckoutCallback")]
        public async Task<IActionResult> CheckoutCallback([FromForm] string token)
        {
            RetrieveCheckoutFormRequest request = new RetrieveCheckoutFormRequest();
            request.Token = token;

            Iyzipay.Options options = new Iyzipay.Options
            {
                ApiKey = "sandbox-aMqc85z6hayNJmHSoZXAGxdvruaYwkWi",
                SecretKey = "sandbox-zkMyw4uHeLFDt9CTltscujK6dVk6Piem",
                BaseUrl = "https://sandbox-api.iyzipay.com"
            };

            var checkoutFormResponse = CheckoutForm.Retrieve(request, options);

            RetrievePaymentRequest paymentRequest = new RetrievePaymentRequest();
            paymentRequest.PaymentId = checkoutFormResponse.PaymentId;

            Payment payment = Payment.Retrieve(paymentRequest, options);
            var test = HttpContext;

            var test2 = HttpContext.Request.Body.ToString();

            var test3 = await ReadRequestBodyAsStringAsync(HttpContext);

            if (checkoutFormResponse.Status == Status.SUCCESS.ToString())
            {
                return base.Content("<div>Subscribed successfully</div>", "text/html"); // Need to redirect to success page
            }

            return BadRequest();


        }

        [ApiExplorerSettings(IgnoreApi = true)]
        private async Task<string> ReadRequestBodyAsStringAsync(HttpContext context)
        {
            using (var reader = new StreamReader(context.Request.Body, encoding: Encoding.UTF8))
            {
                return await reader.ReadToEndAsync();
            }
        }

        [HttpPost("SubscriptionStatusNotification")]
        public async Task<IActionResult> SubscriptionStatusNotification([FromBody] dynamic data)
        {
            return Ok();
        }

        [HttpPost("PaymentNotification")]
        public async Task<IActionResult> PaymentNotification([FromBody] dynamic data)
        {
            var paymentResponse = JsonConvert.DeserializeObject<PaymentResponseViewModel>(data.ToString());
            string conversationId = paymentResponse.PaymentConversationId;
            var paymentId = paymentResponse.PaymentId.ToString();

            if (paymentResponse.IyziEventType == "THREE_DS_AUTH" && paymentResponse.Status == "SUCCESS")
            {
                await _iyizicoService.UpdateClassCourseTransaction(conversationId, paymentId);
            }
            if (paymentResponse.Status == "SUCCESS")
            {
                await _iyizicoService.UpdateSchoolTransaction(conversationId, paymentId, false);
            }
            if (paymentResponse.Status == "FAILURE")
            {
                HandlePaymentFailure(data.iyziPaymentId);
            }

            return Ok();
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task RetryPayment(string subscriptionCode)
        {
            RetrySubscriptionRequest request = new RetrySubscriptionRequest
            {
                SubscriptionOrderReferenceCode = subscriptionCode
            };
            Iyzipay.Options options = new Iyzipay.Options
            {
                ApiKey = "sandbox-aMqc85z6hayNJmHSoZXAGxdvruaYwkWi",
                SecretKey = "sandbox-zkMyw4uHeLFDt9CTltscujK6dVk6Piem",
                BaseUrl = "https://sandbox-api.iyzipay.com"
            };


            Subscription.Retry(request, options);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public void CancelSubscription(string subscriptionCode)
        {
            RetrieveSubscriptionRequest subRequest = new RetrieveSubscriptionRequest();
            Iyzipay.Options options = new Iyzipay.Options
            {
                ApiKey = "sandbox-aMqc85z6hayNJmHSoZXAGxdvruaYwkWi",
                SecretKey = "sandbox-zkMyw4uHeLFDt9CTltscujK6dVk6Piem",
                BaseUrl = "https://sandbox-api.iyzipay.com"
            };

            var subScription = Subscription.Retrieve(subRequest, options);
            if (subScription.Data.SubscriptionStatus == SubscriptionStatus.UNPAID.ToString())
            {
                // Need to update the table and make the status to false here

                CancelSubscriptionRequest cancelSubscriptionRequest = new CancelSubscriptionRequest
                {
                    SubscriptionReferenceCode = subscriptionCode
                };

                Subscription.Cancel(cancelSubscriptionRequest, options);
            }

        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public void HandlePaymentFailure(string paymentId)
        {
            string subReferenceCode = "TestCode";
            if (!string.IsNullOrEmpty(subReferenceCode)) //&& !isExpiered)
            {
                BackgroundJob.Schedule((string subCode) => RetryPayment(subReferenceCode), DateTime.UtcNow.AddDays(5));
            }
            BackgroundJob.Schedule((string subCode) => CancelSubscription(subReferenceCode), DateTime.UtcNow.AddDays(10));

        }

        [Route("ownedSchoolTransactionDetails")]
        [HttpPost]
        public async Task<IActionResult> GetSchoolTransactionDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.GetSchoolTransactionDetails(model, userId);
            return Ok(response);
        }

        [Route("classCourseTransactionDetails")]
        [HttpPost]
        public async Task<IActionResult> GetClassCourseTransactionDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.GetClassCourseTransactionDetails(model, userId);
            return Ok(response);
        }

        [Route("cancelSubscription")]
        [HttpPost]
        public async Task<IActionResult> CancelSubscription(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.CancelSubscription(schoolId);
            return Ok(new {errorMessage = response});
        }

        [AllowAnonymous]
        [Route("renewSubscription")]
        [HttpPost]
        public async Task<IActionResult> RenewSubscription(Guid schoolId)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.RenewSubscription(schoolId);
            return Ok(response);
        }


        [Route("refundPayment")]
        [HttpPost]
        public async Task<IActionResult> RefundPayment(string paymentId, SchoolClassCourseEnum type)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.RefundPayment(paymentId,type);
            return Ok(new { errorMessage = response});
        }

    }
}
