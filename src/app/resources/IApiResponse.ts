import { AxiosResponse } from "axios";

export interface StringKeyObject {
  [key: string]: any;
}

export type TApiState = Record<string, any> | null;

// export default interface ApiResponse<T = any>
//   extends Partial<AxiosResponse<T | TApiState>> {
//   data: TApiState;
//   error: TApiState;
//   success: boolean;
//   message: string;
// }

export default interface ApiResponse extends Partial<AxiosResponse<any>> {
  success?: boolean;
  data: TApiState;
  error: TApiState;
}
