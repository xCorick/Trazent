using Trazent.Infraestructure.Models.Exceptions;

namespace Trazent.Infraestructure.Common.Extensions
{

        public static class FunctionalExtensions
        {
            public static TResult Map<TSource, TResult>(this TSource @this, Func<TSource, TResult> fn)
            {
                try
                {
                    return fn(@this);
                }
                catch (ApiException)
                {
                    throw;
                }
            }

            public static async Task<TResult> MapAsync<TSource, TResult>(
               this TSource @this,
               Func<TSource, Task<TResult>> fn)
            {
                try
                {
                    return await fn(@this);
                }
                catch (ApiException)
                {
                    throw;
                }
            }

            public static async Task<TResult> MapAsync<TSource, TResult>(
                this Task<TSource> @this,
                Func<TSource, TResult> fn)
            {
                try
                {
                    return fn(await @this);
                }
                catch (ApiException)
                {
                    throw;
                }
            }

            public static Task<T> AsTask<T>(this T @this) => Task.FromResult(@this);
        }

        public static class Disposable
        {
            public static TResult Using<TDisposable, TResult>(Func<TDisposable> factory,
                Func<TDisposable, TResult> fn) where TDisposable : IDisposable
            {
                using (var disposable = factory())
                {
                    return fn(disposable);
                }
            }

            public static async Task<TResult> UsingAsync<TDisposable, TResult>(Func<TDisposable> factory,
                Func<TDisposable, Task<TResult>> fn)
                where TDisposable : IDisposable
            {
                using (var disposable = factory())
                {
                    return await fn(disposable);
                }
            }
        }

    }
