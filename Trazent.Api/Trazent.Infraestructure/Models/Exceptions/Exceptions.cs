using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Trazent.Infraestructure.Models.Exceptions
{
    public class ApiException : Exception
    {
        public string ErrorCode { get; set; }
        public object ErrorObject { get; set; }

        public Error ToError() => new(ErrorCode, ErrorObject);

        public ApiException(string errorCode, object errorObject)
        {
            ErrorCode = errorCode;
            ErrorObject = errorObject;
        }

        public ApiException(string errorCode) : base(errorCode)
        {
            ErrorCode = errorCode;
        }
    }
}
