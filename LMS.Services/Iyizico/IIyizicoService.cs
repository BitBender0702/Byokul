﻿using Iyzipay.Model;
using LMS.Common.Enums;
using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Stripe;
using LMS.Data.Entity;
using LMS.Services.FileStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Iyizico
{
    public interface IIyizicoService
    {
        //Task<BuySchoolSubscriptionViewModel> BuySchoolSubscription(BuySchoolSubscriptionViewModel model,string userId,Guid schoolId);
        Task<List<SchoolSubscriptionPlansViewModel>> GetSubscriptionPlans();
        Task<string> BuySchoolClassCourse(BuySchoolClassCourseViewModel model, string userId);
        Task UpdateSchoolTransaction(string ConversationId, string paymentId, bool isInternationalUser);
        Task UpdateSchoolClassCourseTransaction(string ConversationId, string paymentId);
        Task<TransactionsDetailsViewModel> GetSchoolTransactionDetails(TransactionParamViewModel model, string userId);
        Task<TransactionsDetailsViewModel> GetClassCourseTransactionDetails(TransactionParamViewModel model, string userId);
        Task<TransactionsDetailsViewModel> GetAllTransactionDetails(TransactionParamViewModel model, string userId);
        void CloseIyizicoThreeDAuthWindow(string userId);
        Task<string> CancelSubscription(Guid schoolId);
        Task<string> RenewSubscription(Guid schoolId);
        Task<string> RefundPayment(string paymentId, LMS.Common.Enums.SchoolClassCourseEnum type);
        Task<string> BuySchoolSubscription(BuySchoolSubscriptionViewModel model, string userId, Guid schoolId);
        Task<List<CardList>> GetUserSavedCards(string email);
        Task<bool> CreateCard(CardInformation cardInfo, string email);
        Task<bool> RemoveCard(string cardUserKey, string cardToken);
        Task<string> CreateSubMerchent(User user);
        //Task<CardList> RetrieveCards();








    }
}
