import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Controller, Post, Get, Middleware } from '@overnightjs/core';

import { User } from '@src/models/user';

import { BaseController } from '@src/controllers';

import { AuthService } from '@src/services/auth';

import { authMiddleware } from '@src/middlewares/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(request: Request, response: Response): Promise<void> {
    try {
      const user = new User(request.body);
      const newUser = await user.save();
      response.status(StatusCodes.CREATED).send(newUser);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(response, error);
    }
  }

  @Post('authenticate')
  public async authenticate(
    request: Request,
    response: Response
  ): Promise<Response | undefined> {
    const { email, password } = request.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return this.sendErrorResponse(response, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User not found!',
      });
    }

    const validPassword = await AuthService.comparePasswords(
      password,
      user.password
    );

    if (!validPassword) {
      return this.sendErrorResponse(response, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'Password does not match!',
      });
    }

    const token = AuthService.generateToken(user.toJSON());

    return response.status(StatusCodes.OK).send({ token: token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(request: Request, response: Response): Promise<Response> {
    const email = request.decoded?.email;
    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(response, {
        code: StatusCodes.NOT_FOUND,
        message: 'User not found!',
      });
    }

    return response.status(StatusCodes.OK).send({ user });
  }
}
