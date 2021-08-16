using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace LineRunnerApp.Models
{
    public class AuthorizationOptions
    {
        public const string ISSUER = "RunnerAppToken";
        public const string AUDIENCE = "RunnerAppClient";
        const string KEY = "AnfUSD6FND7ND5N9Dk12G";
        public const int LIFETIME = 60;
        public static SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.ASCII.GetBytes(KEY));
        }
    }
}
