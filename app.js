const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(expressLayouts);
// Public folder
app.use(express.static('public'));

// Bagian routes
app.get('/', (req, res) => {
    res.render('index', { 
      layout: 'layouts/main-layout',
      title: "Login"
    });
  });
  app.get('/home', (req, res) => {
    res.render('home', {
      layout: 'layouts/main-layout',// layout yang digunakan
      title: "Home",
    });
  })
  app.get('/about', (req, res) => {
    res.render('about', {
      layout: 'layouts/main-layout',
      title: "About",
    });
  });
  // Untuk url http://localhost:3000/product/29?category=shoes
  // app.get('/product/:id', (req, res) => {
  //   res.send(`Product ID: ${req.params.id} <br> Category: ${req.query.category}`);
  // });
  app.use((req, res) => {
      res.status(404);
      res.send('404: Page not found');
  });
  
  app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
  });