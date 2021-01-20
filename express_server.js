const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const generateShortURL = function(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};

const deleteData = function(shortURL) { //function to remove existing shortened URLs from our database
  delete urlDatabase[shortURL];
};

const updateData = function(newLongURL, shortURL) {
  urlDatabase[shortURL] = newLongURL;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
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
  // res.redirect(`/urls/${shortURL}`);
  res.redirect("/urls/");

});

app.post("/login", (req, res) => { //  LOGIN ROUTE
  // console.log(req.body.username);
  const username = req.body.username;
  res.cookie("username", username);

  // res.render('urls_index', templateVars);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => { //  LOGOUT ROUTE
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => { //implement a DELETE
  deleteData(req.params.shortURL);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  res.render('urls_index', templateVars);
});

app.post("/urls/:shortURL/update", (req, res) => { //implement a UPDATE

  res.redirect(`/urls/${req.params.shortURL}`);
  // updateData(req.params.shortURL);
  // const templateVars = { urls: urlDatabase };
  // res.render('urls_show', templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  updateData(req.body.newURL, req.params.shortURL);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => { 
   const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => { 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], }; 
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
