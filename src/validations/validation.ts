//this was made for the controllers
// isEmpty function
const isEmpty = (arr: any[]): boolean => {
  return arr.length === 0;
};

// isArray function
const isArray = (arr: any): boolean => {
  return Array.isArray(arr);
};

// Validate required fields
const validateFields = (req: { body: { [key: string]: any } }, requiredFields: string[]): string[] => {
  const missingFields = requiredFields.filter(field => !req.body[field]);
  return missingFields;
};

// Validate email
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};
const trimSpaces = (str: string): string => {
  return str.trim();
};
export { isEmpty, isArray, validateFields, validateEmail, trimSpaces };
