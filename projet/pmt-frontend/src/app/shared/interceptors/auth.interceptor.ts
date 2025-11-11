import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get current user from localStorage
  const currentUserStr = localStorage.getItem('currentUser');
  
  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr);
      
      // Clone the request and add the User-Id header
      const authReq = req.clone({
        setHeaders: {
          'User-Id': currentUser.id.toString()
        }
      });
      
      return next(authReq);
    } catch (error) {
      console.error('Failed to parse current user from localStorage', error);
    }
  }
  
  // If no user or error, proceed with original request
  return next(req);
};
