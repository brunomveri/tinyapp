const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const generateRandomChar = function(length) {
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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] }; 
  res.render("urls_register", templateVars)
});

//EMAIL LOOKUP HELPER FUNCTION
const emailLookUp = function(email) {
  for (let user in users) {
    // console.log(users[user]);
    if (email === users[user].email) {
      return true;
    }
  }
};

//REGISTER submit handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('Error 400');
  } else if (emailLookUp(req.body.email)) {
    res.status(400);
    res.send('Error 400');
  } else {
  const newID = generateRandomChar(6);
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newID);
  res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] }; //////HERE
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);

});

//NEW shortURL
app.post("/urls", (req, res) => {

  const shortURL = generateRandomChar(6);  //Generates our new shortURL
  urlDatabase[shortURL] = req.body.longURL; //Adds to database
  // res.redirect(`/urls/${shortURL}`);
  res.redirect("/urls/");

});

// //*****OLD*******LOGIN submit handler*********OLD//
// app.post("/login", (req, res) => { 
//   const username = req.body.username;
//   res.cookie("username", username);  ///////OLD COOKIE
//   res.redirect('/urls');
// });
const idLookUp = function(email) {
  console.log(email);
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
};

app.post("/login", (req, res) => { 
  const user = idLookUp(req.body.email);
  console.log(user);
  if (!user) {
    res.status(400);
    res.send('Error 400');
  } else if (req.body.password === user.password) {
    res.cookie("user_id", user.id);
    res.redirect('/urls');
  } else {
    res.status(400);
    res.send('Error 400');
  }
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.body.email };
  res.render('urls_login', templateVars);
});

//LOGOUT submit handler
app.post("/logout", (req, res) => { 
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//DELETE submit handler
app.post("/urls/:shortURL/delete", (req, res) => { 
  deleteData(req.params.shortURL);
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVars);
});

//UPDATE submit handler
app.post("/urls/:shortURL/update", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: users[req.cookies["user_id"]] }; 
  res.render("urls_show", templateVars);
});

//ERROR 400
// app.get("*", (req, res) => {
//   res.status(400);
//   res.send
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
