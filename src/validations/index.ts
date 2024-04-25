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

// Function to send 500 Internal Server Error responses
function sendInternalErrorResponse(res: Response, err: unknown): void {
  // Ensure the error is an instance of Error
  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({ ok: false, message });
}

export { isArray, isEmpty, validateFields, validateEmail, sendInternalErrorResponse };
