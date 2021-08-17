using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LineRunnerApp.Models
{
    public class AxeModel
    {
        [Key]
        [Column(Order = 1)]
        public long Id { get; set; }

        [Required]
        public double XPoint { get; set; }

        [Required]
        public double YPoint { get; set; }
    }
}
