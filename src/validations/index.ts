import { Response } from 'express';

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
// Function to validate gender (male or female)
export const validateGender = (gender: string) => {
  return gender === 'male' || gender === 'female';
};
// Function to validate password format (alphanumeric with special characters)
export const validatePassword = (password: string) => {
  // For example, ensuring it contains at least one letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Function to send 500 Internal Server Error responses
function sendInternalErrorResponse(res: Response, err: unknown): void {
  // Ensure the error is an instance of Error
  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({ ok: false, message });
}

export { isArray, isEmpty, validateFields, validateEmail, sendInternalErrorResponse };
