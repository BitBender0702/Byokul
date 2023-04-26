using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.Stripe;
using LMS.Data.Entity;
using LMS.Services.Stripe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Stripe;
using Stripe.Checkout;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("stripe")]
    [ApiController]
    public class StripeController : BaseController
    {
        private readonly IStripeService _stripeService;
        private readonly UserManager<User> _userManager;

        public StripeController(IStripeService stripeService, UserManager<User> userManager)
        {
            _stripeService = stripeService;
            _userManager = userManager;
        }

        [Route("buySubscription")]
        [HttpPost]
        public async Task<IActionResult> BuySubscription(BuySubscriptionViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var priceId = await _stripeService.CreateProduct(model);

            var checkOuturl = await _stripeService.CreateCheckout(priceId, userId, model);
            return Ok();
        }


        [Route("ownedSchoolTransactionDetails")]
        [HttpPost]
        public async Task<IActionResult> GetSchoolTransactionDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _stripeService.GetSchoolTransactionDetails(model, userId);
            return Ok(response);
        }

        [Route("withdrawDetails")]
        [HttpPost]
        public async Task<IActionResult> GetWithdrawDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _stripeService.GetWithdrawDetails(model, userId);
            return Ok(response);
        }

        [Route("allTransactionDetails")]
        [HttpPost]
        public async Task<IActionResult> GetAllTransactionDetails([FromBody] TransactionParamViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _stripeService.GetAllTransactionDetails(model, userId);
            return Ok(response);
        }

        [Route("payout")]
        [HttpPost]
        public async Task<IActionResult> Payout([FromBody] PayoutViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            var response = await _stripeService.Payout(model,userId);
            return Ok(response);
        }

        [AllowAnonymous]
        [Route("webhook")]
        [HttpPost]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            try
            {
                var stripeEvent = EventUtility.ParseEvent(json);
                if (stripeEvent.Type == Events.PaymentIntentSucceeded)
                {
                    PaymentIntent paymentIntent = stripeEvent.Data.Object as PaymentIntent;


                    var paymentIntentService = new PaymentIntentService();
                    var paymentIntent2 = await paymentIntentService.GetAsync(paymentIntent.Id);

                    var transaction = new TransactionViewModel
                    {
                        Amount = paymentIntent.Amount/100,
                        StripeCustomerId = paymentIntent.CustomerId,
                        StripeProductId = paymentIntent.Metadata["product_id"],
                        UserId = paymentIntent.Metadata["user_id"],
                        OwnerId = paymentIntent.Metadata["owner_id"],

                    };


                    var result = await _stripeService.SaveTransaction(transaction);
                    return StatusCode(200, new { result = result });
                }
                else
                {
                    Console.WriteLine("Unhandled event type: {0}", stripeEvent.Type);
                }
                return Ok();
            }

            catch (StripeException e)
            {
                return BadRequest();
            }
        }


        [Route("succesCheckout")]
        [HttpGet]
        public async Task<IActionResult> SuccesCheckout()
        {
            string successMessage = "Checkout is Success";
            return Ok(new { status = successMessage });
        }

        [Route("failedCheckout")]
        [HttpGet]
        public async Task<IActionResult> FailedCheckout()
        {
            string failedMessage = "Checkout is Failed";
            return Ok(new { status = failedMessage });
        }
    }
}
