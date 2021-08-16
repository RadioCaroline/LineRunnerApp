using LineRunnerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LineRunnerApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost(@"/token")]
        public async Task<IActionResult> Token([FromForm]string username)
        {
            ClaimsIdentity identity = await GetIdentityAsync(username);

            if (identity == null)
            {
                return BadRequest();
            }

            JwtSecurityToken jwtoken = new(
                issuer: AuthorizationOptions.ISSUER,
                audience: AuthorizationOptions.AUDIENCE,
                notBefore: System.DateTime.Now,
                claims: identity.Claims,
                expires: System.DateTime.Now.Add(
                    TimeSpan.FromMinutes(AuthorizationOptions.LIFETIME)),
                signingCredentials: new SigningCredentials(
                    AuthorizationOptions.GetSymmetricSecurityKey(),
                    SecurityAlgorithms.HmacSha256));
            string encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwtoken);
            return Json(new
            {
                access_token = encodedJwt,
                username = identity.Name
            });
        }

        private static async Task<ClaimsIdentity> GetIdentityAsync(string username)
        {
            using AccountContext db = new();
            UserModel person = await db.Users.FirstOrDefaultAsync(x => x.Login == username);
            if (person != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimsIdentity.DefaultNameClaimType, person.Login)
                };
                ClaimsIdentity claimsIdentity = new(claims, "Token",
                    ClaimsIdentity.DefaultNameClaimType,
                    ClaimsIdentity.DefaultRoleClaimType);

                return claimsIdentity;
            }

            return null;
        }
    }
}
