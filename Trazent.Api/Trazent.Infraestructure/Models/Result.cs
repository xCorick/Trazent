using System;
using System.Collections.Generic;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Trazent.Infraestructure.Models
{ 
    public interface IResult<out T>
    {
        T? Data { get; }
        bool Succeeded { get; }
        Error? Error { get; }
    }

    public static class Result
    {
        public static IResult<T> Success<T>(T data)
        {
            return new ResultInternal<T>(data);
        }

        public static IResult<T> Failed<T>(Error error)
        {
            return new ResultInternal<T>(error);
        }

        private class ResultInternal<T> : IResult<T>
        {
            public T? Data { get; }
            public bool Succeeded { get; }
            public Error? Error { get; }

            public ResultInternal(T data)
            {
                Data = data;
                Succeeded = true;
                Error = default;
            }

            public ResultInternal(Error error)
            {
                Data = default;
                Succeeded = false;
                Error = error;
            }
        }
    }
}
