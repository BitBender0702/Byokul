using Iyzipay.Model;
using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Iyizico;
using LMS.Common.ViewModels.Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Iyizico
{
    public interface IIyizicoService
    {
        Task BuySchoolSubscription(BuySchoolSubscriptionViewModel model,string userId);
        Task<List<SchoolSubscriptionPlansViewModel>> GetSubscriptionPlans();
        Task<Payment> BuyClassCourse(BuyClassCourseViewModel model, string userId);


    }
}
