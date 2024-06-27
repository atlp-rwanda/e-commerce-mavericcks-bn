import { calculatePasswordExpirationDate } from '../../controllers/authController';
import { mockUser } from './mocks/user';

describe('calculatePasswordExpirationDate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate expiration date based on lastPasswordUpdated', () => {
    const expirationDate = calculatePasswordExpirationDate(mockUser);
    const expectedExpirationDate = new Date('2023-06-08T10:40:00.000Z');

    expect(expirationDate).toEqual(expectedExpirationDate);
  });

  it('should calculate expiration date based on createdAt if lastPasswordUpdated is not present', () => {
    const userWithoutLastPasswordUpdated = { ...mockUser, lastPasswordUpdated: undefined };

    const expirationDate = calculatePasswordExpirationDate(userWithoutLastPasswordUpdated);
    const expectedExpirationDate = new Date('2023-01-08T10:40:00.000Z');

    expect(expirationDate).toEqual(expectedExpirationDate);
  });

  it('should return null if neither lastPasswordUpdated nor createdAt are present', () => {
    const userWithoutDates = { ...mockUser, lastPasswordUpdated: undefined, createdAt: undefined };

    const expirationDate = calculatePasswordExpirationDate(userWithoutDates);

    expect(expirationDate).toBeNull();
  });
});
