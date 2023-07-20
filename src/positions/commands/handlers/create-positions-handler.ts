import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import { CreatePositionsCommand } from '../create-positions.command';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { isInstance } from 'class-validator';

@CommandHandler(CreatePositionsCommand)
export class createPositionHandler
  implements ICommandHandler<CreatePositionsCommand>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(command: CreatePositionsCommand): Promise<{ id: string }> {
    try {
      // Check if the length of name is at least 2 characters
      if (command.name.length < 2) {
        throw new BadRequestException('name must be at least 2 characters');
      }
      // Check if the length of description is at least 6 characters
      if (command.description.length < 6) {
        throw new BadRequestException(
          'description must be at least 6 characters',
        );
      }
      const parentId = command.parentId;
      // Check if this is the first position
      const isFirstPosition = (await this.positionsRepository.count()) === 0;
      // Check if the position with the same name already exists
      const positionExists = await this.positionsRepository.findOneBy({
        name: command.name,
      });
      // Throw an error if the position already exists
      if (positionExists) {
        throw new BadRequestException('Position already exists');
      }
      // Find the parent position if the parent id is provided
      const parent = parentId
        ? await this.positionsRepository.findOneBy({ id: parentId })
        : null;
      // Throw an error if the parent position is not found
      if (parentId && !parent) {
        throw new BadRequestException('Parent Position Not Found!');
      }
      // Throw an error if any other position has a null parent
      if (!isFirstPosition && !parentId) {
        throw new BadRequestException('Parent position must be provided');
      }
      // Create a new position entity and set its properties
      const position = new PositionsEntity();
      position.name = command.name;
      position.description = command.description;
      // Set the parent position if it is provided and valid
      if (parent) {
        position.parent = parent;
      }
      // Save the position entity to the database
      const newPosition = await this.positionsRepository.save(position);
      // Return the id of the newely created position entity
      return { id: newPosition.id };
    } catch (error) {
      // Check if the error is custom bad request error
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Something went wrong while creating`,
      );
    }
  }
}
