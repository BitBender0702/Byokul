using LMS.Data.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Middleware
{
    //public class UrlMiddleware
    //{
    //    private readonly RequestDelegate _next;

    //    public UrlMiddleware(RequestDelegate next)
    //    {
    //        _next = next;
    //    }

    //    public async Task InvokeAsync(HttpContext context)
    //    {
    //        string currentRoute = "/users/globalFeed";
    //        if (context.Request.Path.ToString().ToLower().Contains(currentRoute.ToLower()))
    //        {
    //            context.Response.Redirect("users/userFollowers", true);
    //            await _next(context);
    //            return;
    //        }
    //        await _next(context);
    //    }
    //}
    public class UrlMiddleware
    {
        private readonly RequestDelegate _next;
        private bool IsRedirect = false;
        public UrlMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string requestedPath = context.Request.Path.ToString().ToLower();
            //if (requestedPath.Contains("+"))
            //{
            //    requestedPath.Replace("+", "");
            //}
            if (requestedPath.Contains("/profile/school/") || requestedPath.Contains("/profile/class") || requestedPath.Contains("/profile/course"))
            {
                string path = context.Request.Path.ToString();
                var containsSlash = path.Substring(path.Length - 1);
                if (containsSlash != "/")
                {
                    string newPath = path + "/";
                    context.Response.Redirect(newPath);
                    //await _next(context);
                    return;
                }
            }
            await _next(context);
        }
    }
}
