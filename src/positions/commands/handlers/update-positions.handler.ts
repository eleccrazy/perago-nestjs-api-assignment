import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePositionsCommand } from '../update-positions.command';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PositionsEntity } from 'src/entities/positions.entity';
import { InjectRepository } from '@nestjs/typeorm';

@CommandHandler(UpdatePositionsCommand)
export class UpdatePositonsHandler
  implements ICommandHandler<UpdatePositionsCommand>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positonRepository: Repository<PositionsEntity>,
  ) {}
  async execute(command: UpdatePositionsCommand): Promise<{ id: string }> {
    try {
      // Get all required properties
      const id = command.id;
      const name = command.name;
      const description = command.description;
      const parentId = command.parentId;

      // Variable to check if there is a value to be get updated
      let isTherePropertyToUpdate = false;

      // Id is required to update the position
      if (!id) {
        throw new BadRequestException('Position ID is required');
      }
      // Get the position to be updated. This query includes the special left join sql query to include the parent positon on the result.
      const positionToUpdate = await this.positonRepository
        .createQueryBuilder('position')
        .where('position.id = :id', { id: id })
        .leftJoinAndSelect('position.parent', 'parent')
        .getOne();
      // If the position with the given id is not found, return an error message
      if (!positionToUpdate) {
        throw new BadRequestException('Position not found');
      }
      // Check if we have name
      if (name) {
        if (typeof name !== 'string') {
          throw new BadRequestException('name must be a string');
        }
        // Check if the name is already taken by another position
        const positionExists = await this.positonRepository.findOneBy({
          name: name,
        });
        if (positionExists && positionExists.id !== positionToUpdate.id) {
          throw new BadRequestException('Position already exists');
        }
        // Check if the name is the same as the current name of the position. If it is the same, we won't update the name.
        if (name !== positionToUpdate.name) {
          positionToUpdate.name = name;
          isTherePropertyToUpdate = true;
        }
      }
      // check if we have description
      if (description) {
        if (typeof description !== 'string') {
          throw new BadRequestException('description must be a string');
        }
        // Check if the description is the same as the current description of the position. If it is the same, we won't update the description.
        if (description !== positionToUpdate.description) {
          positionToUpdate.description = description;
          isTherePropertyToUpdate = true;
        }
      }
      // Check if we have parentId
      if (parentId) {
        // Check if the position being update is the root position in the tree. In that case, we won't update its parent position.
        if (!positionToUpdate.parent) {
          throw new BadRequestException(
            'This position can not have a parent one',
          );
        }
        // Check if the parentId is the same as the position id being updated. In that case, we won't update its parent position.
        // The position can not be its own parent
        if (parentId === id) {
          throw new BadRequestException(
            'The position can not be its own parent',
          );
        }

        // Find the parent position
        const parent = await this.positonRepository.findOneBy({ id: parentId });
        if (!parent) {
          throw new BadRequestException('Parent Position Not Found!');
        }
        // Get all children positions of the position
        const childrenPositions = await this.positonRepository.find({
          where: {
            parent: {
              id: id,
            },
          },
        });
        // Check if the parent positon is the children of the position
        const isChilderPosition = childrenPositions.filter(
          (pos) => pos.id === parentId,
        );
        // If the position with parentId is the children of the position being updated, send an bad request message.
        if (isChilderPosition.length > 0) {
          throw new BadRequestException(
            "Child position of the positoin being update can't be the parent postion for it",
          );
        }
        // If the parent position is the same as the current parent position of the position being updated, we won't update the parent position.
        if (parentId !== positionToUpdate.parent.id) {
          // Update the parent position
          positionToUpdate.parent = parent;
          isTherePropertyToUpdate = true;
        }
      }
      // If we do have nothing to update, we send a bad request response to the client
      if (!isTherePropertyToUpdate) {
        throw new BadRequestException(
          'Nothing to update, you should specify at least one property for updating',
        );
      }
      // Save the changes to reflect it on the database.
      const updatedPosition = await this.positonRepository.save(
        positionToUpdate,
      );
      // Return the updated position id as a success message to the client
      return { id: updatedPosition.id };
    } catch (error) {
      // Check if the error is custom bad request error
      if (error instanceof BadRequestException) {
        throw error;
      }
      // If it is not a custom bad request error, send the default internal server error with custom message
      throw new InternalServerErrorException(
        'Something went wrong while updating',
      );
    }
  }
}
