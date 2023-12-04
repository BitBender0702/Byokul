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
using LMS.Common.ViewModels.Chat;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.Stripe;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using LMS.Data.Entity.Common;
using LMS.Data.Migrations;
using LMS.DataAccess.Repository;
using LMS.Services;
using LMS.Services.Blob;
using LMS.Services.Iyizico;
using LMS.Services.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using System.Text;

namespace LMS.App.Controllers
{
    [Route("iyizico")]
    public class IyzicoController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IIyizicoService _iyizicoService;
        private readonly ChatHubs _chatHubs;
        private readonly IHubContext<ChatHubs> _hubContext;
        private IGenericRepository<Comment> _commentRepository;
        private IGenericRepository<SchoolClassCourseTransaction> _schoolClassCourseTransactionRepository;
        private IConfiguration _config;

        public IyzicoController(UserManager<User> userManager, IIyizicoService iyizicoService, ChatHubs chatHubs, IHubContext<ChatHubs> hubContext, IGenericRepository<SchoolClassCourseTransaction> schoolClassCourseTransactionRepository, IConfiguration config)
        {
            _userManager = userManager;
            _iyizicoService = iyizicoService;
            _chatHubs = chatHubs;
            _hubContext = hubContext;
            _schoolClassCourseTransactionRepository = schoolClassCourseTransactionRepository;
            _config = config;
        }

        //[Route("buySchoolSubscription")]
        //[HttpPost]
        //public async Task<IActionResult> BuySchoolSubscription([FromBody] BuySchoolSubscriptionViewModel model)
        //{
        //    var userId = await GetUserIdAsync(this._userManager);
        //    var schoolId = new Guid();
        //    await _iyizicoService.BuySchoolSubscription(model, userId, schoolId);

        //    return Ok();
        //}

        [Route("getSubscriptionPlans")]
        [HttpPost]
        public async Task<IActionResult> GetSubscriptionPlans()
        {
            var response = await _iyizicoService.GetSubscriptionPlans();

            return Ok(response);
        }

        [Route("buySchoolClassCourse")]
        [HttpPost]
        public async Task<IActionResult> BuySchoolClassCourse([FromBody] BuySchoolClassCourseViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.BuySchoolClassCourse(model, userId);
            return Json(response);
        }

        [HttpPost("callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback([FromBody] ThreeDCallbackViewModel callbackModel)
        {
            try
            {
                string userId = "";
                string userConnectionId = "";
                if (callbackModel.Status == "CALLBACK_THREEDS")
                {
                    userId = await _schoolClassCourseTransactionRepository.GetAll().Where(x => x.ConversationId == callbackModel.PaymentConversationId).Select(x => x.ActionDoneBy).FirstAsync();

                    Iyzipay.Options options = new Iyzipay.Options
                    {
                        //ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                        //SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                        //BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")

                        ApiKey = "sandbox-ErjSK6FUTbZa2utyEJ2R2nVqKofoDipU",
                        SecretKey = "sandbox-lducaaS6qCX2hBmzvijo95MpFgU5GIOB",
                        BaseUrl = "https://sandbox-api.iyzipay.com"
                    };

                    CreateThreedsPaymentRequest request = new CreateThreedsPaymentRequest();

                    request.ConversationId = callbackModel.PaymentConversationId.ToString();
                    request.PaymentId = callbackModel.PaymentId.ToString();



                    //if (!string.IsNullOrEmpty(callbackModel.ConversationData))
                    //{
                    //    request.ConversationData = callbackModel.ConversationData;
                    //}

                    ThreedsPayment threedsPayment = ThreedsPayment.Create(request, options);

                    if (threedsPayment.Status == Status.SUCCESS.ToString())
                    {



                        //userConnectionId = _chatHubs.GetUserConnectionId(userId);
                        //if (userConnectionId != null)
                        //{
                        //    await _hubContext.Clients.Client(userConnectionId).SendAsync("close3dsPopup");
                        //}
                        //_iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                        return base.Content("<div>Payment successful.</div>", "text/html");
                    }
                    if (threedsPayment.Status == Status.FAILURE.ToString())
                    {
                        //_iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                        return base.Content("<div>Your payment has failed. Please try again.</div>", "text/html");
                    }
                }
                if (callbackModel.Status == "SUCCESS")
                {
                    try
                    {
                        await _iyizicoService.UpdateSchoolClassCourseTransaction(callbackModel.PaymentConversationId, callbackModel.PaymentId.ToString());
                        userId = await _schoolClassCourseTransactionRepository.GetAll().Where(x => x.ConversationId == callbackModel.PaymentConversationId).Select(x => x.ActionDoneBy).FirstAsync();
                        userConnectionId = _chatHubs.GetUserConnectionId(userId);
                        if (userConnectionId != null)
                        {
                            await _hubContext.Clients.Client(userConnectionId).SendAsync("paymentResponse", "true");
                        }
                    }
                    catch (Exception ex)
                    {
                        userConnectionId = _chatHubs.GetUserConnectionId(userId);
                        if (userConnectionId != null)
                        {
                            await _hubContext.Clients.Client(userConnectionId).SendAsync("paymentResponse", "false");
                        }
                    }

                    //Iyzipay.Options options = new Iyzipay.Options
                    //{
                    //    //ApiKey = this._config.GetValue<string>("IyzicoSettings:ApiKey"),
                    //    //SecretKey = this._config.GetValue<string>("IyzicoSettings:SecretKey"),
                    //    //BaseUrl = this._config.GetValue<string>("IyzicoSettings:BaseUrl")

                    //    ApiKey = "sandbox-ErjSK6FUTbZa2utyEJ2R2nVqKofoDipU",
                    //    SecretKey = "sandbox-lducaaS6qCX2hBmzvijo95MpFgU5GIOB",
                    //    BaseUrl = "https://sandbox-api.iyzipay.com"
                    //};
                    //CreateThreedsPaymentRequest request = new CreateThreedsPaymentRequest();

                    //request.ConversationId = callbackModel.PaymentConversationId.ToString();
                    //request.PaymentId = callbackModel.PaymentId.ToString();

                    ////if (!string.IsNullOrEmpty(callbackModel.ConversationData))
                    ////{
                    ////    request.ConversationData = callbackModel.ConversationData;
                    ////}

                    //ThreedsPayment threedsPayment = ThreedsPayment.Create(request, options);

                    //if (threedsPayment.Status == Status.SUCCESS.ToString())
                    //{




                    //    //_iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                    //    return base.Content("<div>Payment successful.</div>", "text/html");
                    //}
                    //if (threedsPayment.Status == Status.FAILURE.ToString())
                    //{
                    //    //_iyizicoService.CloseIyizicoThreeDAuthWindow(request.ConversationId);
                    //    return base.Content("<div>Your payment has failed. Please try again.</div>", "text/html");
                    //}



                }

                //if (callbackModel.Status == "FAILURE")
                //{
                //    HandlePaymentFailure(data.iyziPaymentId);
                //}
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
                await _iyizicoService.UpdateSchoolClassCourseTransaction(conversationId, paymentId);
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

        [Route("allTransactionDetails")]
        [HttpPost]
        public async Task<IActionResult> GetAllTransactionDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.GetAllTransactionDetails(model, userId);
            return Ok(response);
        }

        [Route("cancelSubscription")]
        [HttpPost]
        public async Task<IActionResult> CancelSubscription(Guid schoolId)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.CancelSubscription(schoolId);
            return Ok(new { errorMessage = response });
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
        public async Task<IActionResult> RefundPayment(string paymentId, Common.Enums.SchoolClassCourseEnum type)
        {
            //var userId = await GetUserIdAsync(this._userManager);
            var response = await _iyizicoService.RefundPayment(paymentId, type);
            return Ok(new { errorMessage = response });
        }

        [Route("getUserSavedCards")]
        [HttpGet]
        public async Task<IActionResult> GetUserSavedCards()
        {
            var email = User.Identity.Name;
            //var email = "john2Doe11@gmail.com";
            var response = await _iyizicoService.GetUserSavedCards(email);
            if (response.Count > 0)
            {
                return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.SavedCardRetrieveSuccessfully, Data = response });
            }
            return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.CardsNotExist, Data = response });
        }

        [Route("createCard")]
        [HttpPost]
        public async Task<IActionResult> CreateCard(CardInformation cardInfo)
        {
            var email = User.Identity.Name;
            var response = await _iyizicoService.CreateCard(cardInfo, email);
            if (response)
            {
                return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.CardsCreatedSuccessfully });
            }
            return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.InvalidCard });
        }

        [Route("removeCard")]
        [HttpPost]
        public async Task<IActionResult> RemoveCard(string cardUserKey, string cardToken)
        {
            var response = await _iyizicoService.RemoveCard(cardUserKey, cardToken);
            if (response)
            {
                return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.CardsRemovedSuccessfully });
            }
            return Ok(new { Success = true, Message = Common.ViewModels.Post.Constants.InvalidCard });
        }

        //[Route("retrieveCard")]
        //[HttpPost]
        //public async Task<IActionResult> RetrieveCards()
        //{
        //    await _iyizicoService.RetrieveCards();
        //    return Ok();
        //}

    }
}
