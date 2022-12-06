import { HttpErrorResponse } from "@angular/common/http";

export interface IValidationError {
  property: string;
  children: any[];
  constraints: { [key: string]: string };
}

export interface IBackendError extends HttpErrorResponse {
  message: string;
  description: IValidationError[];
}

export interface IBackendErrorResponse extends HttpErrorResponse {
  error: IBackendError;
}
