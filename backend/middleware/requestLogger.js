const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ipAddress}`);
  
  // Log request body for POST/PUT requests (but not for sensitive routes)
  if ((method === 'POST' || method === 'PUT') && !url.includes('login') && !url.includes('password')) {
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
  }
  
  // Log response status when request is finished
  res.on('finish', () => {
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - Status: ${statusCode}`);
  });
  
  next();
};

module.exports = requestLogger;