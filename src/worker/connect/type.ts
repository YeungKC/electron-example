export interface MessagePortResponse<Data> {
  data?: Data;
  error?: Error;
}

export interface MessagePortData<Data> {
  prefix: string;
  id: number;
  type: string;

  data: Data;
}
