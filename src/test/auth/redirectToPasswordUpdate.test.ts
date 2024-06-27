import { redirectToPasswordUpdate } from '../../controllers/authController';
import { Response } from 'express';

describe('redirectToPasswordUpdate', () => {
  let resMock: Partial<Response>;

  beforeEach(() => {
    resMock = {
      redirect: jest.fn(),
    };
  });

  it('should call res.redirect with the correct URL', () => {
    redirectToPasswordUpdate(resMock as Response);

    expect(resMock.redirect).toHaveBeenCalledWith('/api/user/passwordUpdate');
  });
});
