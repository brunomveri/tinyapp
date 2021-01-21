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

//function to remove existing shortened URLs from our database
const deleteData = function(shortURL) {
  delete urlDatabase[shortURL];
};

const updateData = function(newLongURL, shortURL) {
  urlDatabase[shortURL].longURL = newLongURL;
};
///////////////
const urlsForUser = function(id, database /* req.cookies["user_id"]*/) {
  const userUrls = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = { 
        longURL: database[shortURL].longURL,
        userID: id
       };
    }
  }
  return userUrls;
};
/////////////

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// console.log(urlDatabase);

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
  // console.log("users database", users);
  res.cookie("user_id", newID);
  res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const userURLS = urlsForUser(req.cookies["user_id"], urlDatabase);
  const templateVars = { urls: userURLS, username: users[req.cookies["user_id"]] }; //////HERE
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // console.log("urls_new",req.cookies["user_id"]);
  if(!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);

});

//NEW shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomChar(6);  //Generates our new shortURL
  // urlDatabase[shortURL] = req.body.longURL; //Adds to database    ////vai precisar mudar pq o databse mudou de estrutrura
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase);
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
  const userID = req.cookies["user_id"];
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

  deleteData(req.params.shortURL);
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVars);
});

//UPDATE submit handler
app.post("/urls/:shortURL/update", (req, res) => {
  const userID = req.cookies["user_id"];
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
  console.log(req.body.newURL);
  updateData(req.body.newURL, req.params.shortURL);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => { 
   const longURL = urlDatabase[req.params.shortURL].longURL;
   res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];



  // const urlForUser = urlsForUser(userID, urlDatabase);
  // const longURL = urlForUser[shortURL] && urlForUser[shortURL].longURL;
  // const userCreatedURL = urlForUser[shortURL] && urlForUser[shortURL].userID === userID;

  if (!userID) {
    res.send("You are not logged in");
    return;
  }
  if (userID !== urlObject.userID) {
    res.send("You don't have access to this content");
    return;
  }
  // if (!userCreatedURL) {
  //   res.send("You don't have access to this content");
  //   return;
  // }
  const templateVars = { shortURL, longURL: urlObject.longURL, username: users[userID] }; 
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
