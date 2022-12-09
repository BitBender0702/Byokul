using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Stripe
{
    public interface IStripeService
    {
        Task<string> CreateProduct();
        Task<string> CreatePrice(string productId);
        Task<string> CreateCheckout(string priceId);

    }
}
