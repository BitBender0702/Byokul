using LMS.Common.ViewModels.Chat;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace LMS.App.Hubs
{
    public class MessageHub: Hub
    {
        public async Task NewMessage(Message msg)
        {
            await Clients.All.SendAsync("MessageReceived", msg);
        }
    }
}
