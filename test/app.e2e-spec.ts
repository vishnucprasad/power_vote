import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { request, spec } from 'pactum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { RefreshToken, User } from '../src/user/entity';
import { Repository } from 'typeorm';
import { RegisterDto, SigninDto } from 'src/user/dto';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.init();
  app.listen(3001);

  request.setBaseUrl('http://localhost:3001');

  const userRepo: Repository<User> = moduleRef.get(getRepositoryToken(User));
  const refreshTokenRepo: Repository<RefreshToken> = moduleRef.get(
    getRepositoryToken(RefreshToken),
  );
  refreshTokenRepo.delete({});
  userRepo.delete({});
});

afterAll(() => {
  app.close();
});

describe('User /user', () => {
  describe('POST /user/register', () => {
    it('should throw an error if no body is provided', () => {
      return spec().post('/user/register').expectStatus(400);
    });

    it('should throw an error if firstName is empty', () => {
      const dto: Omit<RegisterDto, 'firstName'> = {
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'JohnDoe@123',
      };

      return spec().post('/user/register').withBody(dto).expectStatus(400);
    });

    it('should throw an error if lastName is empty', () => {
      const dto: Omit<RegisterDto, 'lastName'> = {
        firstName: 'John',
        email: 'johndoe@example.com',
        password: 'JohnDoe@123',
      };

      return spec().post('/user/register').withBody(dto).expectStatus(400);
    });

    it('should throw an error if email is empty', () => {
      const dto: Omit<RegisterDto, 'email'> = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'JohnDoe@123',
      };

      return spec().post('/user/register').withBody(dto).expectStatus(400);
    });

    it('should throw an error if password is empty', () => {
      const dto: Omit<RegisterDto, 'password'> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
      };

      return spec().post('/user/register').withBody(dto).expectStatus(400);
    });

    it('should register new user', () => {
      const dto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'JohnDoe@123',
      };

      return spec()
        .post('/user/register')
        .withBody(dto)
        .expectStatus(201)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.lastName)
        .expectBodyContains(dto.email);
    });

    it('should throw an error if email is already in use', () => {
      const dto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'JohnDoe@123',
      };

      return spec()
        .post('/user/register')
        .withBody(dto)
        .expectStatus(403)
        .expectBodyContains(dto.email);
    });
  });

  describe('POST /user/signin', () => {
    it('should throw an error if no body is provided', () => {
      return spec().post('/user/signin').expectStatus(400);
    });

    it('should throw an error if email is empty', () => {
      const dto: Omit<SigninDto, 'email'> = {
        password: 'JohnDoe@123',
      };

      return spec().post('/user/signin').withBody(dto).expectStatus(400);
    });

    it('should throw an error if password is empty', () => {
      const dto: Omit<SigninDto, 'password'> = {
        email: 'johndoe@example.com',
      };

      return spec().post('/user/signin').withBody(dto).expectStatus(400);
    });

    it('should throw an error if provided email is invalid', () => {
      const dto: SigninDto = {
        email: 'john@example.com',
        password: 'JohnDoe@123',
      };

      return spec().post('/user/signin').withBody(dto).expectStatus(404);
    });

    it('should throw an error if provided password is invalid', () => {
      const dto: SigninDto = {
        email: 'johndoe@example.com',
        password: 'invalid',
      };

      return spec().post('/user/signin').withBody(dto).expectStatus(401);
    });

    it('should signin the user', () => {
      const dto: SigninDto = {
        email: 'johndoe@example.com',
        password: 'JohnDoe@123',
      };

      return spec()
        .post('/user/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('accessToken', 'access_token')
        .stores('refreshToken', 'refresh_token');
    });
  });

  describe('GET /user', () => {
    it('should throw an error if no authorization bearer is provided', () => {
      return spec().get('/user').expectStatus(401);
    });

    it('should throw an error if provided authorization bearer is invalid', () => {
      return spec()
        .get('/user')
        .withBearerToken('invalid bearer token')
        .expectStatus(401);
    });

    it('should get user details', () => {
      return spec()
        .get('/user')
        .withBearerToken('$S{accessToken}')
        .expectStatus(200);
    });
  });
});
