const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registration = mongoose.createConnection(
  "mongodb+srv://pratham30_:CHPLTtjE1fT7IaP2@assignment4a.t8t0fmt.mongodb.net/?retryWrites=true&w=majority"
);
const blog = mongoose.createConnection(
  "mongodb+srv://pratham30_:CHPLTtjE1fT7IaP2@assignment4a.t8t0fmt.mongodb.net/?retryWrites=true&w=majority"
);
const read = mongoose.createConnection(
  "mongodb+srv://pratham30_:CHPLTtjE1fT7IaP2@assignment4a.t8t0fmt.mongodb.net/?retryWrites=true&w=majority"
);

const registration_schema = new Schema({
  fname: String,
  lname: String,
  email: String,
  username: {
    type: String,
    unique: true,
  },
  Address1: String,
  Address2: String,
  city: String,
  postal: String,
  country: String,
  password: {
    type: String,
    unique: true,
  },
});

const blog_schema = new Schema({
  title: String,
  content: String,
});

const read_schema = new Schema({
  read: String,
});

const customer = registration.model("registration", registration_schema);
const blog_connection = blog.model("blog_db", blog_schema);
const read_connection = read.model("read_db", read_schema);

app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use(bodyParser.urlencoded({ extended: true }));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
  blog_connection
    .findOne()
    .exec()
    .then((data) => {
      console.log(data);
      res.render("blog", {
        title: data.title,
        content: data.content,
        layout: false,
      });
    });
});

app.get("/article", function (req, res) {
  read_connection
    .findOne()
    .exec()
    .then((data) => {
      res.render("read_more", { read: data.read, layout: false });
    });
});

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "/login.html"));
});
app.post("/login", (req, res) => {
  var userdata = {
    user: req.body.username,
    pass: req.body.password,
    expression: /[~`!#@$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
      req.body.username
    ),
  };

  if (userdata.user == "" || userdata.pass == "") {
    res.render("login", { data: userdata, layout: false });
    return;
  }

  if (userdata.expression) {
    res.render("login", { data: userdata, layout: false });
    return;
  }

  customer
    .findOne({ username: userdata.user, password: userdata.pass }, [
      "fname",
      "lname",
      "username",
    ])
    .exec()
    .then((data) => {
      if (data) {
        if (data.id == "6366c66a9afb45a8af4a82c4") {
          res.render("login_Dashboard", {
            fname: data.fname,
            lname: data.lname,
            username: data.username,
            layout: false,
          });
          return;
        } else {
          res.render("loginuser_Dashboard", {
            fname: data.fname,
            lname: data.lname,
            username: data.username,
            layout: false,
          });
          return;
        }
      } else {
        res.render("login", {
          error: "You entered wrong username and/or password",
          layout: false,
        });
        return;
      }
    });
});

app.get("/registration", function (req, res) {
  res.sendFile(path.join(__dirname, "/registration.html"));
});
app.post("/registration", (req, res) => {
  var userdata = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone_number: req.body.phone_number,
    city: req.body.city,
    test_phone: /^\d{10}$/.test(req.body.phone_number),
    Address1: req.body.Address1,
    Address2: req.body.Address2,
    postal_code: req.body.postal_code,
    postal_test:
      /^[AaBbCcEeGgHiJjKkLlMmNnPpRrSsTtVvXxYy]\d[A-Za-z] \d[A-Za-z]\d$/.test(
        req.body.postal_code
      ),
    country: req.body.country,
    password: req.body.password,
    test_password: /^[0-9a-zA-Z]{6,12}$/.test(req.body.password),
    confirm_password: req.body.confirm_password,
  };

  var password_check = () => {
    if (userdata.password == userdata.confirm_password) {
      return true;
    }
    return false;
  };

  userdata.password_check = password_check;

  if (
    userdata.fname == "" ||
    userdata.lname == "" ||
    userdata.email == "" ||
    userdata.phone_number == "" ||
    userdata.Address1 == "" ||
    userdata.city == "" ||
    userdata.postal_code == "" ||
    userdata.country == "" ||
    userdata.password == "" ||
    userdata.confirm_password == ""
  ) {
    res.render("registration", { data: userdata, layout: false });
    return;
  }

  if (!userdata.test_phone) {
    res.render("registration", { data: userdata, layout: false });
    return;
  }
  if (!userdata.postal_test) {
    res.render("registration", { data: userdata, layout: false });
    return;
  }
  if (!userdata.test_password) {
    res.render("registration", { data: userdata, layout: false });
    return;
  }
  if (!userdata.password_check) {
    res.render("registration", { data: userdata, layout: false });
    return;
  }

  var username = "";
  for (let index = 0; index < userdata.email.length; index++) {
    const element = userdata.email[index];
    if (element != "@") {
      username += element;
    }
    if (element == "@") {
      break;
    }
  }
  let new_account = new customer({
    fname: userdata.fname,
    lname: userdata.lname,
    email: userdata.email,
    username: username,
    Address1: userdata.Address1,
    Address2: userdata.Address2,
    city: userdata.city,
    postal: userdata.postal_code,
    country: userdata.country,
    password: userdata.password,
  }).save((e, data) => {
    if (e) {
      console.log(e);
    } else {
      console.log(data);
    }
  });
  res.render("dashboard", { layout: false });
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
