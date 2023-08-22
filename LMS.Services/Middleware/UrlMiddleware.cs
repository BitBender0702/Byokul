using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Middleware
{
    public class UrlMiddleware
    {
        private readonly RequestDelegate _next;

        public UrlMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {

            if (context.Request.Path.ToString().ToLower().Contains("fileStorage/getAttachments"))
            {
                await _next(context);
                return;
            }
            await _next(context);
        }
    }
}
