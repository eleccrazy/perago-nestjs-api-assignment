import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePositionsCommand } from '../delete-positions.command';
import { PositionsEntity } from 'src/entities/positions.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@CommandHandler(DeletePositionsCommand)
export class DeletePositionsHandler
  implements ICommandHandler<DeletePositionsCommand>
{
  constructor(
    @InjectRepository(PositionsEntity)
    private positionsRepository: Repository<PositionsEntity>,
  ) {}
  async execute(command: DeletePositionsCommand) {
    const { id } = command;
    try {
      // Delete the position if it is find with the provided id.
      const result = await this.positionsRepository.delete(id);
      // If the position with the provided id is not found, send a bad request 400 response to the client
      if (result.affected === 0) {
        throw new NotFoundException('Position Not Found!');
      }
      // If the position deletion is successfull, send the appropriate message to the client.
      return { message: 'Position Deleted Successfully!' };
    } catch (error) {
      // Check if the error is Not found error
      if (error instanceof NotFoundException) {
        throw error;
      }
      // If the error is a QueryFailedError with a foreign key constraint violation, re-throw it as a BadRequestException with a custom message.
      if (
        error instanceof QueryFailedError &&
        error.message.includes('violates foreign key constraint')
      ) {
        throw new BadRequestException(
          'Position has child positions, cannot be deleted!',
        );
      }
      // Otherwise, re-throw some cusotm internal server error message
      throw new InternalServerErrorException(
        'Something went wrong while deleting',
      );
    }
  }
}
