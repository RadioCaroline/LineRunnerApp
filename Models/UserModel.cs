using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace LineRunnerApp.Models
{
    public class UserModel
    {
        [Key]
        [Column(Order = 1)]
        public int Id { get; set; }

        [MaxLength(50)]
        [Required(ErrorMessage = "Неправильно указан логин")]
        public string Login { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime LastLogin { get; set; }

        [NotMapped]
        public ICollection<UserEventModel> Events { get; set; }
    }
}
