const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateShortURL = function(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};

const deleteData = function(shortURL) { //function to remove existing shortened URLs from our database
  delete urlDatabase[shortURL];
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

  const shortURL = generateShortURL(6);  //Generates our new shortURL
  urlDatabase[shortURL] = req.body.longURL; //Adds to database
  res.redirect(`/urls/${shortURL}`);

});

app.post("/urls/:shortURL/delete", (req, res) => { //implement a DELETE operation using POST
  deleteData(req.params.shortURL);
  const templateVars = { urls: urlDatabase };
  // urlDatabase.deleteData(req.params.shortURL);
  res.render('urls_index', templateVars);
});

app.get("/u/:shortURL", (req, res) => { //como surgiu a route /u/ ?
   const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => { //para que serve o parametro ':shortURL?'
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }; 
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// app.get("/url.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b><body></html>\n");
// });

