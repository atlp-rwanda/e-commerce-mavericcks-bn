import Role from '../database/models/role';
import User from '../database/models/user';
import logger from '../logs/config';

const getDefaultRole = async () => {
  const defaultRole = await Role.findOne({ where: { name: 'buyer' } });
  if (!defaultRole) {
    logger.error('Default role not found.');
    return;
  }
  const defaultRoleId = defaultRole.id;
  return defaultRoleId;
};
export const getUserNames = async (id: string) => {
  const result = await User.findOne({ where: { id } });
  return { firstName: result?.firstName, lastName: result?.lastName, photo: result?.photoUrl };
};
export default getDefaultRole;
