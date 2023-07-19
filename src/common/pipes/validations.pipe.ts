import {
  ParseUUIDPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// Modified version of ParseUUIDPipe to throw a NotFoundException when the id param is not a valid uuid
export const validateIdParam = new ParseUUIDPipe({
  exceptionFactory: () => {
    throw new NotFoundException('Position Not Found!');
  },
});
