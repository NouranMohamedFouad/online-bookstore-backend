import reviewValidationMiddleware from './middlewares/reviewVaildation.js'; // Adjust the path if needed

// Mock Express objects
const mockRequest = (body) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    console.log(`Response Status: ${code}`);
    return res;
  };
  res.json = (data) => console.log('Response JSON:', data);
  return res;
};
const mockNext = () => console.log('✅ Validation Passed! Moving to next middleware.');

// Test cases
const testCases = [
  {
    name: '✅ Valid Data',
    body: { userid: 1, bookid: 10, rating: 5, comment: 'Great book!' }
  },
  {
    name: '❌ Missing Comment',
    body: { userid: 1, bookid: 10, rating: 5 }
  },
  {
    name: '❌ Invalid Rating (Out of Range)',
    body: { userid: 1, bookid: 10, rating: 6, comment: 'Nice!' }
  },
  {
    name: '❌ Invalid Characters in Comment',
    body: { userid: 1, bookid: 10, rating: 4, comment: '<script>alert(1)</script>' }
  }
];

// Run tests
testCases.forEach((testCase) => {
  console.log(`\nRunning Test: ${testCase.name}`);
  const req = mockRequest(testCase.body);
  const res = mockResponse();

  reviewValidationMiddleware(req, res, mockNext);
});
