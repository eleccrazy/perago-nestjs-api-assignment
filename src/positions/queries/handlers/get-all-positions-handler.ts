import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { GetAllPositionsQuery } from '../get-all-positions.query';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

@QueryHandler(GetAllPositionsQuery)
export class GetAllPositionsHandler
  implements IQueryHandler<GetAllPositionsQuery>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(query: GetAllPositionsQuery): Promise<PositionsEntity[]> {
    try {
      // Return an array of Positions.
      return await this.positionsRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while retriving positions from the database',
      );
    }
  }
}
