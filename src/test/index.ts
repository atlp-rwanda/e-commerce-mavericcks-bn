import { addition } from '../controllers/testController';

test('Adding 2 and 1 equals 3', () => {
  expect(2 + 1).toBe(3);
});
test('Addition function adds two numbers correctly', () => {
  // Test case 1: Testing addition of positive numbers
  expect(addition(2, 3)).toBe(5); // Expected result: 2 + 3 = 5

  // Test case 2: Testing addition of negative numbers
  expect(addition(-2, -3)).toBe(-5); // Expected result: -2 + (-3) = -5

  // Test case 3: Testing addition of a positive and a negative number
  expect(addition(5, -3)).toBe(2); // Expected result: 5 + (-3) = 2

  // Test case 4: Testing addition of zero and a number
  expect(addition(0, 7)).toBe(7); // Expected result: 0 + 7 = 7

  // Test case 5: Testing addition of a number and zero
  expect(addition(4, 0)).toBe(4); // Expected result: 4 + 0 = 4
});
