exports.userLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  res.redirect("/user");
};

//admin

exports.adminLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

exports.adminLogout = (req, res) => {
  req.session.user = false;
  req.session.admin = false;
  req.session.destroy();
  res.redirect("/admin");
};

// const userloggedin= ()=>{
//   if (req.session.user) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// };

// const adminLoggedIn=()=>{
//   if (req.session.admin) {
//     next();
//   } else {
//     res.redirect("/admin");
//   }
// };

// exports.module={
//   userloggedin,
//   adminLoggedIn
// }
