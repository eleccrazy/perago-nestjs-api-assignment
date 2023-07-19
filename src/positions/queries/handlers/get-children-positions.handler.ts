import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import { GetChildrenPositionsQuery } from '../get-children-positions.query';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@QueryHandler(GetChildrenPositionsQuery)
export class GetChildrenPositionsHandler
  implements IQueryHandler<GetChildrenPositionsQuery>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(query: GetChildrenPositionsQuery) {
    try {
      const { id } = query;
      const position = await this.positionsRepository.findOneBy({ id: id });
      // Send an appropriate error message if the position is not found.
      if (!position) {
        throw new NotFoundException('Position Not Found!');
      }
      // Get all children positions if the position with the provided id is found.
      const childrenPositions = await this.positionsRepository.find({
        where: {
          parent: {
            id: id,
          },
        },
      });
      // Return an array of children positions if no error occurs
      return childrenPositions;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong!');
    }
  }
}
