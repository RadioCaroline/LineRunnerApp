using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace LineRunnerApp.Models
{
    public class UserModel
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        [Required(ErrorMessage = "Неправильно указан логин")]
        public string Login { get; set; }

        [AllowNull]
        [DataType(DataType.Date)]
        public DateTime? LastLogin { get; set; }
    }
}
