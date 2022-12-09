using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Stripe
{
    public class StripeService : IStripeService
    {
        public async Task<string> CreateProduct()
        {
            var productOptions = new ProductCreateOptions
            {
                Name = "Test Class",
            };
            var service = new ProductService();
            var product = service.Create(productOptions);

            string priceId = await CreatePrice(product.Id);

            return priceId;
            //return product.Id;
        }

        public async Task<string> CreatePrice(string productId)
        {
            var priceOptions = new PriceCreateOptions
            {
                UnitAmount = 1,
                Currency = "inr",
                Recurring = new PriceRecurringOptions
                {
                    Interval = "year",
                },
                Product = productId,
            };
            var service = new PriceService();
            var price = service.Create(priceOptions);

            return price.Id;
        }


        public async Task<string> CreateCheckout(string priceId)
        {
            var options = new SessionCreateOptions
            {
                SuccessUrl = "http://localhost:44472/stripe/succesCheckout",
                CancelUrl = "http://localhost:44472/stripe/failedCheckout",

                LineItems = new List<SessionLineItemOptions>
                {
                     new SessionLineItemOptions
                     {
                        Price = priceId,
                        Quantity = 1,
                     },
                },
                PaymentMethodTypes = new List<string>
                {
                    "card",
                },
                Mode = "subscription",
            };
            var service = new SessionService();

            Session session = service.Create(options);
            //Response.Headers.Add("Location", session.Url);

            return session.Url;
        }
    }
}
