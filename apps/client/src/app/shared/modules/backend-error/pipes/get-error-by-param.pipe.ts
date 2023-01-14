import { Pipe, PipeTransform } from "@angular/core";
import { IBackendErrorResponse } from "../interfaces/backend-error.interface";
@Pipe({
  name: "getErrorByParam",
})
export class GetErrorByParamPipe implements PipeTransform {
  transform(value: IBackendErrorResponse, key: string): string {
    const error = value.error.description.find((item) => item.property === key);

    if (!error) {
      return "";
    }
    return Object.values(error.constraints)
      .map(
        (error) =>
          error.slice(0, 1).toUpperCase() + error.slice(1).toLowerCase()
      )
      .join("\n");
  }
}
