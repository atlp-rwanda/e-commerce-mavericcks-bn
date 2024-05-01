import bcrypt from 'bcrypt';

export const passwordEncrypt = async (password: string) => {
  const saltRound = await bcrypt.genSalt(12);
  const hashedPwd = await bcrypt.hash(password, saltRound);
  return hashedPwd;
};
export const passwordCompare = async (password: string, inputPwd: string) => {
  return await bcrypt.compare(password, inputPwd);
};
