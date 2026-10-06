const ApiResponse = require('../../src/utils/ApiResponse');

describe('ApiResponse', () => {
  it('should create a successful response when status code is < 400', () => {
    const response = new ApiResponse(200, { key: 'value' }, 'Success');
    expect(response.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ key: 'value' });
    expect(response.message).toBe('Success');
  });

  it('should create a failed response when status code is >= 400', () => {
    const response = new ApiResponse(400, null, 'Bad Request');
    expect(response.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.message).toBe('Bad Request');
  });
});
