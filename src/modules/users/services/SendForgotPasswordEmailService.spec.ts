import AppError from '@shared/errors/AppError';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import SendForgotPasswordEmailService from './SendForgotPasswordEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeMailProvider: FakeMailProvider;
let sendForgotPasswordEmail: SendForgotPasswordEmailService;

beforeEach(() => {
  fakeUsersRepository = new FakeUsersRepository();
  fakeMailProvider = new FakeMailProvider();
  fakeUserTokensRepository = new FakeUserTokensRepository();
  sendForgotPasswordEmail = new SendForgotPasswordEmailService(
    fakeUsersRepository,
    fakeMailProvider,
    fakeUserTokensRepository,
  );
});
describe('SendForgotPasswordEmail', () => {
  it('should be able to recover the password using the email', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

    await fakeUsersRepository.create({
      name: 'Kilson',
      email: 'kilson@kilson.com.br',
      password: '123456',
    });

    await sendForgotPasswordEmail.execute({
      email: 'kilson@kilson.com.br',
    });
    expect(sendMail).toHaveBeenCalled();
  });

  it('should not be able to recover a non-existing user password', async () => {
    await expect(
      sendForgotPasswordEmail.execute({
        email: 'kilson@kilson.com.br',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

    const user = await fakeUsersRepository.create({
      name: 'Kilson',
      email: 'kilson@kilson.com.br',
      password: '123456',
    });

    await sendForgotPasswordEmail.execute({
      email: 'kilson@kilson.com.br',
    });

    expect(generateToken).toHaveBeenCalledWith(user.id);
  });
});
