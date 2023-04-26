using LMS.Common.ViewModels.Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Stripe
{
    public interface IStripeService
    {
        Task<string> CreateProduct(BuySubscriptionViewModel model);
        Task<string> CreateCheckout(string priceId, string userId, BuySubscriptionViewModel model);
        Task<TransactionViewModel> SaveTransaction(TransactionViewModel model);
        Task<TransactionDetailsViewModel> GetSchoolTransactionDetails(TransactionParamViewModel model, string userId);
        Task<TransactionDetailsViewModel> GetWithdrawDetails(TransactionParamViewModel model, string userId);
        Task<TransactionDetailsViewModel> GetAllTransactionDetails(TransactionParamViewModel model, string userId);
        Task<string> Payout(PayoutViewModel model, string userId);

    }
}
