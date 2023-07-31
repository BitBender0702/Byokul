using LMS.Common.ViewModels.BigBlueButton;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.BigBlueButton
{
    public interface IBigBlueButtonService
    {
        Task<Response> Create(NewMeetingViewModel newMeetingViewModel);
        Task<string> Join(JoinMeetingViewModel joinMeetingViewModel);
        Task EndMeeting(EndMeetingViewModel endMeetingViewModel);

    }
}
