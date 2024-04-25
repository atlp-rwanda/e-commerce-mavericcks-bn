import Role from '../database/models/role';
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
export default getDefaultRole;
