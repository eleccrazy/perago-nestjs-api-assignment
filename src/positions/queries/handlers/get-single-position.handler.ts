import { GetSinglePositionQuery } from '../get-single-position.query';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@QueryHandler(GetSinglePositionQuery)
export class GetSinglePositionHandler
  implements IQueryHandler<GetSinglePositionQuery>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(query: GetSinglePositionQuery): Promise<PositionsEntity> {
    try {
      const { id } = query;
      const position = await this.positionsRepository.findOneBy({ id: id });
      // Send an appropriate error message if the position is not found.
      if (!position) {
        throw new NotFoundException('Position Not Found!');
      }
      return position;
    } catch (error) {
      // Check if the error is Not found error
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong!');
    }
  }
}
