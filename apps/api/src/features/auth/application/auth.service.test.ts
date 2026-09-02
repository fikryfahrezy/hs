import { AppError } from "../../../common/errors/app-error";
import { ERROR_CODE } from "@habit-shaper/contracts";
import { EmailAlreadyExistsError } from "../auth.errors";
import { type StoredAuthUser } from "../auth.types";
import { type AuthRepository } from "../data/auth.repository";
import { AuthService } from "./auth.service";
import { type PasswordService } from "./password.service";

const storedUser: StoredAuthUser = {
  id: "186b3c50-9a9e-4802-b167-bbbd71632d4a",
  email: "person@example.com",
  password_hash: "stored-hash",
  timezone: "Asia/Jakarta",
  created_at: new Date("2026-09-02T00:00:00.000Z"),
};

describe("AuthService", () => {
  it("maps an existing email to the registration conflict", async () => {
    const repository = {
      create: jest.fn().mockRejectedValue(new EmailAlreadyExistsError()),
    } as unknown as AuthRepository;
    const passwords = {
      hash: jest.fn().mockResolvedValue("stored-hash"),
    } as unknown as PasswordService;
    const service = new AuthService(repository, passwords);

    await expect(
      service.register({
        email: storedUser.email,
        password: "valid password",
        timezone: storedUser.timezone,
      }),
    ).rejects.toMatchObject<Partial<AppError>>({
      status: 409,
      code: ERROR_CODE.EMAIL_ALREADY_EXISTS,
    });
  });

  it("does not reveal that an email is unknown", async () => {
    const repository = {
      findCredentialsByEmail: jest.fn().mockResolvedValue(null),
    } as unknown as AuthRepository;
    const passwords = {
      verify: jest.fn(),
    } as unknown as PasswordService;
    const service = new AuthService(repository, passwords);

    await expect(
      service.login("person@example.com", "wrong password"),
    ).rejects.toMatchObject<Partial<AppError>>({
      status: 401,
      code: ERROR_CODE.INVALID_CREDENTIALS,
    });
    expect(passwords.verify).not.toHaveBeenCalled();
  });

  it("does not reveal that a password is incorrect", async () => {
    const repository = {
      findCredentialsByEmail: jest.fn().mockResolvedValue(storedUser),
    } as unknown as AuthRepository;
    const passwords = {
      verify: jest.fn().mockResolvedValue(false),
    } as unknown as PasswordService;
    const service = new AuthService(repository, passwords);

    await expect(
      service.login("person@example.com", "wrong password"),
    ).rejects.toMatchObject<Partial<AppError>>({
      status: 401,
      code: ERROR_CODE.INVALID_CREDENTIALS,
    });
  });

  it("never returns the password hash after a successful login", async () => {
    const repository = {
      findCredentialsByEmail: jest.fn().mockResolvedValue(storedUser),
    } as unknown as AuthRepository;
    const passwords = {
      verify: jest.fn().mockResolvedValue(true),
    } as unknown as PasswordService;
    const service = new AuthService(repository, passwords);

    await expect(
      service.login(storedUser.email, "correct password"),
    ).resolves.toEqual({
      id: storedUser.id,
      email: storedUser.email,
      timezone: storedUser.timezone,
      created_at: storedUser.created_at.toISOString(),
    });
  });
});
