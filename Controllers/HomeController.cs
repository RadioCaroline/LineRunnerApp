using LineRunnerApp.Helpers;
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

        /// <summary>
        /// Авторизация пользователя
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
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

            // Глупо сюда засовывать координаты 
            var markers = RunnerCollections.MarkerAxes;

            return Json(new
            {
                access_token = encodedJwt,
                username = identity.Name,
                axes = markers
            });
        }

        private static async Task<ClaimsIdentity> GetIdentityAsync(string username)
        {
            // По заданию не вполне ясно, должны ли существовать пользователи в базе, 
            // или они создаются при входе, поэтому мы получаем пользователя
            using AccountContext db = new();
            UserModel person = await db.Users.FirstOrDefaultAsync(x => x.Login == username);
            // Если такого пользователя нет, то просто создаем нового
            if (person != null)
            {
                // Меняем дату последнего входа пользователя
                person.LastLogin = DateTime.Now;
                db.Users.Update(person);
                await db.SaveChangesAsync();
            }
            else
            {
                person = new UserModel
                {
                    Login = username,
                    LastLogin = DateTime.Now
                };
                db.Users.Add(person);
                await db.SaveChangesAsync();
            }

            // Авторизуем через jwt
            List<Claim> claims = new()
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, person.Login)
            };

            ClaimsIdentity claimsIdentity = new(claims, "Token",
                ClaimsIdentity.DefaultNameClaimType,
                ClaimsIdentity.DefaultRoleClaimType);

            return claimsIdentity;
        }
    }
}
