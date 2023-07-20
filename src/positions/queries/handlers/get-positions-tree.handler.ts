import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import { GetPositionsTreeQuery } from '../get-positions-tree.query';

@QueryHandler(GetPositionsTreeQuery)
export class GetPositionsTreeHandler
  implements IQueryHandler<GetPositionsTreeQuery>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(query: GetPositionsTreeQuery): Promise<any> {
    // First get all positions from the table. Here, we are using the leftJoinAndMapMany to include the children positions on the result, and
    // leftJoinAndSelect to include the parent position on the result so that we can use it to filter the root position.
    const positions = await this.positionsRepository
      .createQueryBuilder('position')
      .leftJoinAndMapMany('position.children', 'position.children', 'child')
      .leftJoinAndSelect('position.parent', 'parent')
      .getMany();

    // Filter the root position
    const rootPositions = positions.filter((position) => !position.parent);
    // Method to build the position tree
    const buildPositionTree = (parentPosition) => {
      // Get the children of the parent position
      const children = positions.filter(
        (position) => position.parent?.id === parentPosition.id,
      );
      // If the parent position has children, build the position tree for each child
      if (children.length > 0) {
        parentPosition.children = children.map(buildPositionTree);
      }
      // Remove the parent property before returning the position object
      delete parentPosition.parent;

      return parentPosition;
    };

    // Build the position tree for each root position
    const positionTrees = rootPositions.map(buildPositionTree);

    return positionTrees.length === 1 ? positionTrees[0] : positionTrees;
  }
}
