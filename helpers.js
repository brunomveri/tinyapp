const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email)
    return database[user];
  }
  return undefined;

};

const generateRandomChar = function(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};


const urlsForUser = function(id, database) {
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

module.exports = {
  getUserByEmail,
  generateRandomChar,
  urlsForUser
};