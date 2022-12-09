using LMS.Services.Stripe;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace LMS.App.Controllers
{
    [Route("stripe")]
    [ApiController]
    public class StripeController : BaseController
    {
        private readonly IStripeService _stripeService;
        public StripeController(IStripeService stripeService)
        {
            _stripeService = stripeService;
        }
        [Route("checkOut")]
        [HttpPost]
        public async Task<IActionResult> CrateCheckoutSession()
        {
            var priceId = await _stripeService.CreateProduct();

            var checkOuturl = await _stripeService.CreateCheckout(priceId);

            return Ok(new { checkOuturl });


            //var productOptions = new ProductCreateOptions
            //{
            //    Name = "Test Class",
            //};
            //var service2 = new ProductService();
            //var product = service2.Create(productOptions);

            //var priceOptions = new PriceCreateOptions
            //{
            //    UnitAmount = 1,
            //    Currency = "inr",
            //    Recurring = new PriceRecurringOptions
            //    {
            //        Interval = "year",
            //    },
            //    Product = product.Id,
            //};
            //var service1 = new PriceService();
            //var price = service1.Create(priceOptions);
            

            //var options = new SessionCreateOptions
            //{
            //    SuccessUrl = "http://localhost:44472/stripe/succesCheckout",
            //    CancelUrl = "http://localhost:44472/stripe/failedCheckout",


            //    LineItems = new List<SessionLineItemOptions>
            //    {
            //         new SessionLineItemOptions
            //         {
            //            Price = price.Id,
            //            Quantity = 1,
            //         },
            //    },
            //    PaymentMethodTypes = new List<string>
            //    {
            //        "card",
            //    },
            //    Mode = "subscription",
            //};
            //var service = new SessionService();
            //try
            //{
            //    Session session = service.Create(options);
            //    Response.Headers.Add("Location", session.Url);
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}


            //return Ok();
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
