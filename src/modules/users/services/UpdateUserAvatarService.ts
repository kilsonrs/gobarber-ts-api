import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';

import AppError from '@shared/errors/AppError';
import User from '../infra/typeorm/entities/User';
import IUserRepository from '../repositories/IUsersRepository';
import { injectable, inject } from 'tsyringe';

interface IRequest {
  user_id: string;
  avatarFilename: string;
}

@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUserRepository,
  ) {}

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      const userAvatarFilepath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarExists = await fs.promises.stat(userAvatarFilepath);

      if (userAvatarExists) {
        await fs.promises.unlink(userAvatarFilepath);
      }

      user.avatar = avatarFilename;

      await this.usersRepository.save(user);
    }
    return user;
  }
}

export default UpdateUserAvatarService;
