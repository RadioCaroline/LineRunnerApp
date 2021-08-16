using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LineRunnerApp.Models
{
    public class UserEventModel
    {
        [Column(Order = 1)]
        [Key]
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int UserId { get; set; }

        [NotMapped]
        public UserModel User { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime EventTime { get; set; }
    }
}
