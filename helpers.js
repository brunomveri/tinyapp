const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email)
    return database[user];
  }
  // return false;
  return undefined;

};




module.exports = {
  getUserByEmail
};