const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');

const Helper = {
  /**
   * Hash Password Method
   * @param {string} password
   * @returns {string} returns hashed password
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  },
  /**
   * comparePassword
   * @param {string} hashPassword 
   * @param {string} password 
   * @returns {Boolean} return True or False
   */
  comparePassword(hashPassword, password) {
    return password === hashPassword;
  },
  /**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },
  /**
   * Gnerate Token
   * @param {string} id
   * @returns {string} token
   */
  generateToken(user) {
    const token = jwt.sign({
        userId: user.userid,
        email: user.email,
        isAdmin: user.isadmin,
        isActive: user.isActive,
        firstName: user.firstname,
        lastName: user.lastname
    },
      "justanotherrandomsecretkey", { expiresIn: '7d' }
    );
    return token;
  },

  getCleanUser(user) {
    const cleanUser = {
      userId: user.userid,
      email: user.email,
      isAdmin: user.isadmin,
      isActive: user.isActive,
      firstName: user.firstname,
      lastName: user.lastname
    }
    return cleanUser;
  }
}

module.exports = Helper;