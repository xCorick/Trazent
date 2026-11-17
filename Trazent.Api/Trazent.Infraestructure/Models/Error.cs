namespace Trazent.Infraestructure.Models
{
    public class Error
    {
        public string? Code { get; set; }
        public object? Data { get; set; }
        public string? Description { get; set; }
        public Error()
        {
        }

        public Error(string code)
        {
            Code = code;
        }

        public Error(string code, string description)
        {
            Code = code;
            Description = description;
        }

        public Error(string code, object data)
        {
            Code = code;
            Data = data;
        }
    }
}
