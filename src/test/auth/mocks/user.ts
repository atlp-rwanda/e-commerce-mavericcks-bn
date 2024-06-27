import { UserAttributes } from '../../../database/models/user';

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const mockUser: UserAttributes = {
  id: '1',
  firstName: 'Np',
  lastName: 'Leon',
  email: 'nlp@gmail.com',
  password: 'mockPassword',
  gender: 'male',
  phoneNumber: '1234567890',
  verified: true,
  status: UserStatus.ACTIVE,
  createdAt: new Date('2023-01-01T12:00:00Z'),
  updatedAt: new Date('2023-01-01T12:00:00Z'),
  RoleId: '1',
  enable2FA: false,
  lastPasswordUpdated: new Date('2023-06-01T12:00:00Z'),
};
