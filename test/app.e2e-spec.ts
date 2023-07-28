import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { request, spec } from 'pactum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/user/entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/user/dto';

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
  userRepo.clear();
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
});
