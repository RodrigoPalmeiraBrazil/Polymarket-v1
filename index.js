const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.json({
    name: "Rodrigo Palmeira",
    age: 32
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
