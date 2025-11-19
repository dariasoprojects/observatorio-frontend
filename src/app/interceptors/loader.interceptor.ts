import { HttpInterceptorFn } from '@angular/common/http';
import {LoaderService} from '../services/state/loader.service';
import {inject} from '@angular/core';
import {finalize} from 'rxjs';


export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);

  const skip = req.headers.get('skipLoader') === 'true';

  if (!skip) {
    loader.show();
  }

  // Continuar con la petición
  return next(req).pipe(
    finalize(() => {
      if (!skip) {
        loader.hide();
      }
    })
  );
};
