const { getUserByEmail, generateRandomChar, urlsForUser } = require('./helpers')

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "TinyAppCookie",
  keys: ["secret"]
}));
app.set("view engine", "ejs");

//Databases
const urlDatabase = {};
const users = {};

//Get request to redirect the user from "/" to the main page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Get request to render the register page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.session.user_id] }; 
  res.render("urls_register", templateVars)
});

//Post request to submit a user's resgistration to the app
app.post("/register", (req, res) => {
  const password = req.body.password; 
  if (req.body.email === "" || password === "") {
    res.status(400);
    res.send('Error 400');
  } else if (getUserByEmail(req.body.email, users)) { //here
    res.status(400);
    res.send('Error 400');
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newID = generateRandomChar(6);
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = newID;
    res.redirect("/urls");
  }
});

//Get request to render the user's main page
app.get("/urls", (req, res) => {
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userURLS, username: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//Post request to generate a sequence of characters to the short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomChar(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id};
  
  res.redirect("/urls/");

});

//Get request to reder the page which the user can create a new short URL
app.get("/urls/new", (req, res) => {
  if(!req.session.user_id) {
    res.redirect("/login");
  }
  const templateVars = { username: users[req.session.user_id] };
  res.render("urls_new", templateVars);

});

//Get request to render the login page
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.body.email };
  res.render('urls_login', templateVars);
});

//Post request to meke the login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(400);
    res.send('Invalid email. Please check if you typed your email correctly. If you are not registered, please register first');
  }
  
  const doesPasswordsMatch = bcrypt.compareSync(req.body.password, user.password);
 
  if (doesPasswordsMatch) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(400);
    res.send('Password incorrect');
  }

});

//Post request to logout the session
app.post("/logout", (req, res) => { 
  req.session = null;
  res.redirect("/urls");
});

//POST request to delete the short URL
app.post("/urls/:shortURL/delete", (req, res) => { 
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  
  if(!userID) {
    res.send("If you are not logged in, you cannot delete a URL");
    return;
  }

  if (userID !== urlObject.userID) {
    res.send("You don't have access to this content");
    return;
  }

  delete urlDatabase[req.params.shortURL];

  const templateVars = { urls: urlDatabase, username: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

//Enters updated shortURL information to database
app.post("/urls/:shortURL/update", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  
  if(!userID) {
    res.send("If you are not logged in, you cannot update a URL");
  };
  
  if (userID !== urlObject.userID) {
    res.send("You don't have access to this content");
    return;
  }

  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

//Get request to redirect the user to the original URL of the page he created a short URL
app.get("/u/:shortURL", (req, res) => {   
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(400);
    res.send("The URL requested does not exist");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Get request to render the page that the user will use to edit the long URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];

  if (urlObject === undefined) {
    res.status(400);
    res.send("The short URL requested does not exist")
    return;
  }

  if (!userID) {
    res.send("You are not logged in");
    return;
  }
  if (userID !== urlObject.userID) {
    res.send("You don't have access to this content");
    return;
  }
  const templateVars = { shortURL, longURL: urlObject.longURL, username: users[userID] }; 
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});