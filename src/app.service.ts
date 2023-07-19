import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Perago Organization Structure API. An assignment by Gizachew Bayness Kassa';
  }
}
