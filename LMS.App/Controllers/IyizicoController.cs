using Iyzipay.Model;
using Iyzipay.Model.V2.Transaction;
using Iyzipay.Request;
using Iyzipay.Request.V2;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Stripe;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using LMS.Services;
using LMS.Services.Blob;
using LMS.Services.Iyizico;
using LMS.Services.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
            //var userId = await GetUserIdAsync(this._userManager);
            var userId = "d2e00a9d-c26a-4389-a8b3-470a575ef8f4";
           await _iyizicoService.BuySchoolSubscription(model, userId);

            return Ok();
        }

        [Route("getSubscriptionPlans")]
        [HttpPost]
        public async Task<IActionResult> GetSubscriptionPlans()
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.GetSubscriptionPlans();

            return Ok(response);
        }

        [Route("buyClassCourse")]
        [HttpPost]
        public async Task<IActionResult> BuySchoolSubscription([FromBody] BuyClassCourseViewModel model)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var userId = "d2e00a9d-c26a-4389-a8b3-470a575ef8f4";
            await _iyizicoService.BuyClassCourse(model, userId);

            return Ok();
        }

        [HttpPost("Callback")]
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
                        return base.Content("<div>Payment successful.</div>", "text/html");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Ok(); // Need to redirect to success page
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

        private async Task<string> ReadRequestBodyAsStringAsync(HttpContext context)
        {
            // Read the request body as a string
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
            RetrieveTransactionDetailRequest request = new RetrieveTransactionDetailRequest();
            request.PaymentId = "20417262";
            Iyzipay.Options options = new Iyzipay.Options
            {
                ApiKey = "sandbox-aMqc85z6hayNJmHSoZXAGxdvruaYwkWi",
                SecretKey = "sandbox-zkMyw4uHeLFDt9CTltscujK6dVk6Piem",
                BaseUrl = "https://sandbox-api.iyzipay.com"
            };

            var transactionDetails = TransactionDetail.Retrieve(request, options);

            return Ok();
        }

    }
}
