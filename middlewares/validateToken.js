const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../src/users/user.model");

async function validateToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  let result;
  if (!authorizationHeader)
    return res.status(401).json({
      error: true,
      message: "Access token is missing",
    });

  const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
  const options = {
    expiresIn: "1h",
  };
  try {
    let user = await User.findOne({
      accessToken: token,
    });
    // console.log(token);
    if (!user) {
      result = {
        error: true,
        message: `Authorization error`,
      };
      return res.status(403).json(result);
    }

    result = jwt.verify(token, process.env.JWT_SECRET, options);

    if (!user.userId === result.id) {
      result = {
        error: true,
        message: `Invalid token`,
      };

      return res.status(401).json(result);
    }

    result["referralCode"] = user.referralCode;

    req.decoded = result;
    next();
  } catch (err) {
    // console.log(err);
    if (err.name === "TokenExpiredError") {
      result = {
        error: true,
        message: `TokenExpired`,
      };
    } else {
      result = {
        error: true,
        message: `Authentication error`,
      };
    }
    return res.status(403).json(result);
  }
}

module.exports = { validateToken };
