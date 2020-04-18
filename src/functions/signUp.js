const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");
const bcrypt = require("bcrypt");
const validate = require("validate.js");
const Mongoose = require("mongoose");
const User = require("../Models/User.js"); // importing user model for the database
const generateId = require(`./generateId.js`);
const config = require(`./config.js`);

const signUp = (data, callback) => {
  let { username, password, email } = data;

  // querying the database for records with username or email same as the ones from the request,
  // one username or email cannot be user by more than 1 user
  User.find(
    {
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],

      // getting username and email field from database
    },
    "username email",
    (err, results) => {
      // in case of error we send a notification back to the user
      if (err) {
        logError(
          `Failed to query the database for given username and email in signup-attempt socket, err: ${err}`
        );

        callback({
          status: false,
          err: "Failed to retrieve accounts with the same username or email",
        });
        return;

        // no errors occured, proceeding with signing up process
      } else {
        logSuccess(`queried the db for given username and email, no errors`);

        // exactly zero users found with given usernam and email
        if (results.length === 0) {
          logSuccess(
            "found no users with that username and email, proceeding..."
          );

          // declaring constraints for each signup fields
          let constraints = {
            username: {
              presence: true,
              format: {
                pattern: "^(?=.{3,20}$)(?!.*[_]{2})[_a-zA-Z0-9]+(?<![_]{2})$",
                flags: "i",
                message: "can only contain a-z and 0-9 and '_'",
              },
            },
            password: {
              presence: true,
              format: {
                pattern: "^(?=.{6,30}$)[a-zA-Z0-9_?!-+=()*&^%$#@/.,]+$",
                flags: "i",
                message: "some characters are not allowed",
              },
            },
            email: {
              presence: true,
              email: true,
              format: {
                pattern: "^(?=.{4,100}$)[a-zA-Z0-9@.-_]+$",
                flags: "i",
                message: "some characters are not allowed",
              },
            },
          };

          // result variable will be equal to 'undefined' if all the data passed the constraints
          // or will store error data if any occur
          let result = validate(
            {
              username: username,
              password: password,
              email: email,
            },
            constraints
          );

          // displaying the result in case of any errors
          logWarn(
            `result of validation of sign up data: ${JSON.stringify(result)}`
          );

          // undefined means that the data for the signup is valid
          if (result === undefined) {
            logSuccess(`validation of signup data passed, proceeding...`);

            // hashing the password by given number of rounds
            bcrypt.hash(password, config.bcrypt_salt_rounds).then((hash) => {
              logSuccess(`hashed provided password, proceeding...`);

              // generating an userid
              let userid = generateId(config.userid_length);

              logInfo(`generated an user id: ${userid}`);

              // creating a new user
              let newUser = new User({
                _id: new Mongoose.Types.ObjectId(),
                username: username,
                password: hash,
                email: email,
                userId: userid,
                hours_played: 0,
              });

              logSuccess(`created a new user instance, saving it...`);

              // saving the newly created user in the database
              newUser.save((err) => {
                // if any errors while saving the user occur, heres where we send the notification to the client
                if (err) {
                  logFatal(`an error occured while saving a new user: ${err}`);
                  callback({
                    status: false,
                    err: "failed while saving the user in database",
                  });
                  return;
                } else {
                  logSuccess(`successfully saved a new user`);

                  // no errors occured, created the user
                  callback({
                    status: true,
                    mess: `Successfully created a new user`,
                  });
                  return;
                }
              });
            });

            // validation not passed, notifying the client
          } else {
            logWarn(`validation of signup data not passed`);

            // sending back specific info about what went wrong in the process of validation of signup data
            callback({
              status: false,
              err: "Validation not passed",
              username_err: result.username,
              password_err: result.password,
              email_err: result.email,
            });
            return;
          }

          // found users with that username or email
        } else {
          logWarn(
            "We already have user(s) with that username or email in database"
          );

          callback({
            status: false,
            err: "Username or email already taken",
          });
          return;
        }
      }
    }
  );
};

module.exports = signUp;
