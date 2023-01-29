const { nextTick } = require("process");
const twilio = require("twilio");
const config = require("../../config/config");
const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const bcrypt = require("bcrypt");
const client = new twilio(config.accountSID, config.authTocken);
const Address = require("../model/addressModel");
const Cart = require("../model/cartModel");
const { Error } = require("mongoose");
const nodemailer = require("nodemailer");
const { validateExpressRequest } = require("twilio/lib");
//otp purpose
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

//bcrypt
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

exports.why = (req, res) => {
  res.render("user/why");
};

//for signup extra otp
const sendOTP = (mobile, OTP) => {
  return new Promise((resolve, reject) => {
    client.messages
      .create({
        body: `DO NOT SHARE: Your Mzee OTP is ${OTP}.`,
        to: "+917994299413",
        from: "+13854817890",
      })
      .then((send) => {
        resolve(send);
      })
      .catch((error) => {
        reject(new Error("Error sending OTP: " + error.message));
      });
  });
};

//category get cheyyan

const getCategory = function () {
  return new Promise((res, rej) => {
    Category.find()
      .then((categories) => {
        res(categories);
      })
      .catch(() => {
        const error = new Error("could not find categories");
        rej(error);
      });
  });
};

const getProducts = function () {
  return new Promise((res, rej) => {
    Product.find({ isDeleted: false })
      .then((products) => {
        res(products);
      })
      .catch(() => {
        const error = new Error("could not find products");
        rej(error);
      });
  });
};

const getAddress = function () {
  return new Promise((res, rej) => {
    console.log("this side have error");

    console.log("its passed");
    Address.find()
      .then((address) => {
        res(address);
      })
      .catch((err) => {
        const error = new Error("could not get Address");
        rej(error);
      });
  });
};

exports.signUp = (req, res) => {
  res.render("user/signup");
};
exports.signUpCheck = async (req, res) => {
  try {
    const uEmail = req.body.email;
    const uMobile = req.body.mobile;
    const userEmailData = await User.findOne({ email: uEmail });
    if (userEmailData) {
      res.render("user/signup", { message: "user already exists" });
    } else {
      const userMobileData = await User.findOne({ mobile: req.body.mobile });
      if (userMobileData) {
        res.render("user/signup", {
          message: "Mobile number already exists",
        });
      } else if (req.body.password != req.body.cPassword) {
        res.render("user/signup", {
          message: "Passwords are Diffrent",
        });
      } else if (
        req.body.password != "" &&
        req.body.cPassword != "" &&
        req.body.email != "" &&
        req.body.mobile.length == 10 &&
        req.body.name != ""
      ) {
        // Generate OTP and send it to the provided mobile number
        const OTP = generateOTP();
        req.session.OTPofuser = OTP;
        req.session.otpmobile = req.body;
        sendOTP(req.body.mobile, OTP);
        res.render("user/otpVerify");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//sign in
exports.userSignin = (req, res) => {
  if (req.session.user) {
    res.redirect("/user-home");
  } else {
    res.render("user/login");
  }
};
exports.signIn = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.password;

    if (password != "" && email != "") {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        throw new Error("Email or Password is Incorrect,Try again");
      }

      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordMatch) {
        throw new Error("Email or Password is Incorrect,Try again");
      }

      // Check if the user is blocked
      if (user.blockStatus) {
        throw new Error("Your account is blocked, please contact admin.");
      }

      req.session.userData = user;
      req.session.user = true;
      res.redirect("/user-home");
    }
  } catch (err) {
    req.session.user = false;
    res.render("user/login", { message: err.message });
  }
};

exports.userHome = (req, res) => {
  getCategory().then((categories) => {
    getProducts().then((products) => {
      if (req.session.user) {
        res.render("user/index", {
          userData: req.session.userData,
          categories: categories,
          products: products,
        });
        console.log("login success");
      } else {
        res.render("user/index", {
          categories: categories,
          products: products,
        });
      }
    });
  });
};

exports.userLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/user-login");
  }
};
exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  res.redirect("/user-home");
};

exports.mobileOtp = (req, res) => {
  res.render("user/mobileOtp");
};

exports.sendOtp = (req, res) => {
  mobile = req.body.mobile;
  if (mobile.length == 10 && mobile != "") {
    User.findOne({ mobile: mobile }).then((result) => {
      sendOTP(mobile, result.token)
        .then(() => {
          req.session.verifypage = true;
          res.render("user/otpVerify");
        })
        .catch((error) => console.log(error));
    });
  } else {
    let message = "fields cannot empty";
    res.render("user/mobileOtp", { message: message });
  }
};

exports.verifyOtp = (req, res) => {
  return new Promise((resolve, reject) => {
    if (req.session.otpmobile) {
      const otpdata = req.session.otpmobile;
      const OTP = req.session.OTPofuser;
      if (req.query.otp == OTP) {
        // Hash the provided password
        securePassword(otpdata.password)
          .then((passwordHash) => {
            // Create a new user object and save it to the database
            const user = new User({
              name: otpdata.name,
              email: otpdata.email,
              mobile: otpdata.mobile,
              password: passwordHash,
              blockStatus: false,
              token: OTP,
            });
            return user.save();
          })
          .then((userData) => {
            if (userData) {
              req.session.userData = userData;
              req.session.user = true;
              res.redirect("/user-home");
              resolve();
            } else {
              res.render("user/otpVerify", {
                message: "your registration is failed",
              });
              reject(new Error("Registration failed"));
            }
          })
          .catch((err) => {
            console.log(err.message);
            reject(err);
          });
      }
    } else {
      if (req.session.verifypage) {
        const otp = req.query.otp;
        User.findOne({ token: otp })
          .then((result) => {
            if (result) {
              console.log("user irikk");
              if (req.session.changePassword) {
                console.log("password match sir");
                res.render("user/changePassword");
              } else {
                req.session.userData = result;
                req.session.user = true;
                res.redirect("/user-home");
                resolve();
              }
            } else {
              res.render("user/otpVerify", {
                message: "the Otp is Incorrrect",
              });
              reject(new Error("Incorrect OTP"));
            }
          })
          .catch((err) => {
            console.log(err.message);
            reject(err);
          });
      }
    }
  });
};

exports.displayCategory = (req, res) => {
  const category = req.query.id;
  Product.find({ $and: [{ category: category }, { isDeleted: false }] })

    .then((products) => {
      console.log("message from products" + products);
      getCategory()
        .then((categories) => {
          console.log("message after get category" + products);
          res.render("user/shop.hbs", {
            products,
            categoryName: category,
            userData: req.session.userData,
            categories: categories,
          });
        })
        .catch((err) => {
          console.log("error from products" + err);
        });
    })
    .catch((err) => {
      console.log("error from categories" + err);
    });
};

exports.proSearch = (req, res) => {
  const search = req.query.search;
  Product.find({
    $and: [
      {
        $or: [
          { productName: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      },
      { isDeleted: false },
    ],
  })
    .then((products) => {
      getCategory()
        .then((categories) => {
          if (req.session.user) {
            res.render("user/index", {
              userData: req.session.userData,
              categories: categories,
              products: products,
            });
          } else {
            res.render("user/index", {
              categories: categories,
              products: products,
            });
          }
        })
        .catch((err) => {
          console.log("categories not found" + err);
        });
    })
    .catch((err) => {
      console.log("product not found" + err);
    });
};

exports.productView = (req, res) => {
  const id = req.query.id;
  console.log("this is id:" + req.query.id);
  Product.findOne({ _id: id })
    .then((productDetails) => {
      getCategory()
        .then((categories) => {
          res.render("user/productView", {
            categories: categories,
            userData: req.session.userData,
            product: productDetails,
          });
        })
        .catch((err) => {
          console.log("getCategory not found" + err);
        });
    })
    .catch((err) => {
      console.log("product details not found" + err);
    });
};

exports.userProfile = (req, res) => {
  const userData = req.session.userData;
  const errorMessage = req.session.errorMessage;
  const successMessage = req.session.successMessage;
  console.log("address id =" + userData._id);
  getCategory().then((categories) => {
    if (req.query.add) {
      //add address n
      const addAddress = "for et edit address panel";
      res.render("user/userProfile", { addAddress, userData, categories });
    } else if (req.query.edit) {
      const id = req.query.edit;
      Address.findOne({ _id: id }).then((address) => {
        const toEditAddress = "this for edit purpose it redirected to profile";
        res.render("user/userProfile", {
          toEditAddress,
          editAddress: address,
          userData,
          categories,
        });
      });
    } else if (req.query.passEdit) {
      const toEditPassword = "this for password editing";
      res.render("user/userProfile", {
        toEditPassword,
        userData,
        errorMessage,
        categories,
      });
    } else if (req.query.userEdit) {
      const toEditUser = "this for Edit user Page";
      res.render("user/userProfile", {
        toEditUser,
        userData,
        categories,
        successMessage,
      });
    } else {
      Address.find({ owner: userData._id }).then((address) => {
        if (address) {
          res.render("user/userProfile", {
            userData,
            address,
            categories,
            successMessage,
          });
        } else {
          res.render("user/userProfile", { userData, categories });
        }
      });
    }
  });
};

exports.userAddress = (req, res) => {
  const userData = req.session.userData;
  const id = userData._id;
  const address = new Address({
    owner: id,
    name: req.body.name,
    mobile: req.body.mobile,
    address1: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
  });
  address
    .save()
    .then((address) => {
      req.session.address = address;
      let message = "Address Added Successfully";
      req.session.successMessage = message;
      req.session.errorMessage = "";
      req.query.add = false;
      res.redirect("/user-profile");
    })
    .catch((err) => {
      console.log(" new address error" + err);
    });
};

exports.uploadAddress = (req, res) => {
  const id = req.query.id;
  Address.updateOne(
    { _id: id },
    {
      $set: {
        name: req.body.name,
        mobile: req.body.mobile,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
      },
    }
  )
    .then(() => {
      req.query.edit = false;
      let message = "Address Updated Successfully";
      req.session.successMessage = message;
      req.session.errorMessage = "";
      res.redirect("/user-profile");
    })
    .catch((err) => {
      console.log("error in address updation section" + err);
    });
};

exports.changePassword = (req, res) => {
  const id = req.query.id;
  if (
    req.body.currPass != "" &&
    req.body.newPass != "" &&
    req.body.repeatPass != ""
  ) {
    if (req.body.newPass == req.body.repeatPass) {
      User.findOne({ _id: id })
        .then((user) => {
          if (!user) {
            let message = "Password is incorrect";
            req.session.errorMessage = message;
          }
          return bcrypt
            .compare(req.body.currPass, user.password)
            .then((passwordMatch) => {
              if (!passwordMatch) {
                let message = "Previous Password is Incorrect";
                req.session.errorMessage = message;
                req.session.successMessage = "";
                res.redirect("/user-profile?passEdit=true");
              } else {
                securePassword(req.body.newPass)
                  .then((passwordHash) => {
                    User.updateOne(
                      { _id: id },
                      {
                        $set: {
                          password: passwordHash,
                        },
                      }
                    )
                      .then(() => {
                        req.query.passEdit = false;
                        let message = "Password changed Successfully";
                        req.session.user = true;
                        req.session.successMessage = message;
                        req.session.errorMessage = "";
                        res.redirect("/user-profile");
                      })
                      .catch((err) => {
                        console.log("user couldn't update" + err);
                      });
                  })
                  .catch((err) => {
                    console.log("cant get password" + err);
                  });
              }
            })
            .catch((err) => {
              console.log("password not match" + user);
            });
        })
        .catch((err) => {
          console.log("cannot get user" + err);
        });
    } else {
      let message = "Passwords are not match";
      req.session.errorMessage = message;
      req.session.successMessage = "";
      res.redirect("/user-profile?passEdit=true");
    }
  } else {
    let message = "password and fields dont be blank";
    req.session.errorMessage = message;
    req.session.successMessage = "";
    res.redirect("/user-profile?passEdit=true");
  }
};

exports.uploadUser = (req, res) => {
  const id = req.query.id;
  if (req.body.name != "" && req.body.email != "" && req.body.mobile != "") {
    User.find({
      $and: [
        {
          $or: [
            {
              email: req.body.email,
            },
            {
              mobile: req.body.mobile,
            },
          ],
        },
        { _id: { $ne: id } },
      ],
    })
      .then((result) => {
        if (result.length === 0) {
          User.findOneAndUpdate(
            { _id: id },
            {
              $set: {
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
              },
            }
          )
            .then((result) => {
              let message =
                "Profile edited Successfully,(reflects madeby after login)";
              req.session.userData = result;
              req.session.successMessage = message;
              req.session.errorMessage = "";
              res.redirect("/user-profile");
            })
            .catch((err) => {
              console.log("profile can't updated" + err);
            });
        } else {
          let message = "Credintial's will be aldready Taken";
          req.session.errorMessage = message;
          req.session.successMessage = "";
          res.redirect("/user-profile?userEdit=true");
        }
      })
      .catch((err) => {
        console.log("user result not found" + err);
      });
  }
};
//////////
exports.cart = (req, res) => {
  const userData = req.session.userData;
  const id = req.query.id;
  const cartMessage = req.session.cartMessage;
  getCategory().then((categories) => {
    Cart.find({ owner: id })
      .then((carts) => {
        console.log(carts);
        let cartQuantity = carts.map((cart) =>
          Cart.findOne({ quantity: cart.quantity })
        );
        let productsPromise = carts.map((cart) =>
          Product.findOne({ _id: cart.product })
        );
        console.log("ithannn ath" + productsPromise);
        console.log("cart quantity" + cartQuantity);
        return Promise.all(productsPromise);
      })

      .then((products) => {
        res.render("user/cart", {
          products,
          categories,
          userData,
          message: cartMessage,
        });
      })
      .catch((err) => {
        console.log("couldnt find cart" + err);
      });
  });
};

exports.addToCart = (req, res) => {
  console.log("get cart ll keri");
  const id = req.query.id;
  const userData = req.session.userData;

  if (userData) {
    Product.findOne({
      _id: id,
    }).then((result) => {
      Cart.findOne({ product: result._id }).then((cart) => {
        if (!cart) {
          const cartAdd = new Cart({
            owner: userData._id,
            product: result._id,
            quantity: 1,
          });
          cartAdd
            .save()
            .then(() => {
              res.redirect(`/productView?id=${result._id}`);
            })
            .catch((err) => {
              console.log("cannot get cart" + err);
            });
        } else {
          Cart.updateOne({ _id: cart._id }, { $inc: { quantity: 1 } }).then(
            () => {
              res.redirect(`/productView?id=${result._id}`);
            }
          );
        }
      });
    });
  } else {
    res.redirect("/user-login");
  }
};

exports.deleteCart = (req, res) => {
  const userData = req.session.userData;
  const id = req.query.id;
  console.log("the id is " + req.query.id);
  Cart.deleteOne({ product: id })
    .then((result) => {
      let message = "cart deleted Successfully";
      req.session.cartMessage = message;
      res.redirect(`user-home/cart?id=${userData._id}`);
    })
    .catch((err) => {
      console.log("cant delete" + err);
    });
};

exports.emailOtp = (req, res) => {
  const enteredEmail = req.body.email;
  if (enteredEmail != "") {
    User.findOne({ email: enteredEmail })
      .then((result) => {
        if (result) {
          req.session.userId=result._id
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: config.email,
              pass: config.pass,
            },
          });
          const options = {
            from: "mzeeshoes.com",
            to: enteredEmail,
            subject: "Mzee-Shoes OTP VERIFICATION",
            text: `DO NOT SHARE: Your Mzee OTP is ${result.token}.`,
          };

          transporter
            .sendMail(options)
            .then(() => {
              console.log("otp sented");
              req.session.verifypage = true;
              req.session.changePassword = true;
              res.render("user/otpVerify");
            })
            .catch((err) => {
              console.log("couldnt send response" + err);
            });
        } else if (enteredEmail != "") {
          res.render("user/emailOtp", { message: "incorrect credintials" });
        }
      })
      .catch((err) => {
        console.log("user not found" + err);
      });
  }else{
    res.render("user/emailOtp", { message: "fields dont be blank" });
   
  }
};

exports.sendEmailOtp = (req, res) => {
  res.render("user/emailOtp");
};

exports.verifyPassword = (req, res) => {
  console.log("in verify pass");
  const password = req.body.password;

  const cPassword = req.body.cPassword;
  console.log("in verify pass11"+password);
  console.log("in verify pass22"+cPassword);
  const id = req.session.userId;
  console.log("this is "+id)
  if (password != "" && cPassword != "") {
    if (password == cPassword) {
      securePassword(password)
        .then((passwordHash) => {
          User.updateOne(
            { _id: id },
            {
              $set: {
                password: passwordHash,
              },
            }
          )
            .then(() => {
              console.log("to user login");
              req.session.user=false  
              res.redirect("/user-login");
            })
            .catch((err) => {
              console.log("coudnt update the user" + err);
            });
        })
        .catch((err) => {
          console.log("password Hash not working" + err);
        });
    } else {
      req.session.changePassword = true;
      req.session.verifypage = true;
      res.render("user/verifyOtp",{message:"the passwords are not match"});
    }
  }
};

///admin-----------------------------------------------------------------------------------------------------
exports.getAdminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin-dashboard");
  } else {
    res.render("admin/adminLogin");
  }
};
exports.adminLogin = (req, res) => {
  const signInData = req.body;
  const adminData = Admin.findOne({
    userEmail: signInData.email,
    password: signInData.password,
  })
    .then((result) => {
      if (result) {
        req.session.admin = true;
        res.redirect("/admin-dashboard");
      } else if (
        !result &&
        signInData.email != "" &&
        signInData.password != ""
      ) {
        req.session.admin = false;
        res.render("admin/adminLogin", { message: "wrong credentials" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.adminLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin-login");
  }
};

exports.userManagement = (req, res) => {
  User.find((err, users) => {
    if (!err) {
      req.session.users = users;
      res.render("admin/adminUsers", {
        users,
        adminMessage: req.session.adminMessage,
      });
    } else {
      console.log(err.message);
    }
  });
};
exports.userSearch = (req, res) => {
  const search = req.body.search;
  console.log("search ,,," + search);
  User.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ],
  })
    .then((result) => {
      if (result) {
        res.render("admin/adminUsers", { users: result });
      } else {
        let message = "User not found";
        req.session.adminMessage = message;
        res.redirect("admin/adminUsers");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.userEdit = (req, res) => {
  const id = req.query.id;
  req.session.userId = id;
  User.findOne({ _id: id })
    .then((result) => {
      res.render("admin/adminEditUsers", { user: result });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.userUpdate = (req, res) => {
  User.updateOne(
    { _id: req.session.userId },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
      },
    }
  )
    .then(() => {
      let message = "User Updated successfully";
      req.session.adminMessage = message;
      res.redirect("/admin-panel/user");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.userDelete = (req, res) => {
  const id = req.query.id;
  User.deleteOne({ _id: id }).then(() => {
    let message = "User Deleted Successfully";
    req.session.adminMessage = message;
    res.redirect("/admin-panel/user");
  });
};
exports.userDashboard = (req, res) => {
  res.render("admin/adminDashboard");
};
exports.userBlock = (req, res) => {
  const id = req.query.id;
  User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } })
    .then(() => {
      res.redirect("/admin-panel/user");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.userUnBlock = (req, res) => {
  const id = req.query.id;
  User.findOneAndUpdate({ _id: id }, { $set: { blockStatus: false } })
    .then(() => {
      res.redirect("/admin-panel/user");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.adminLogout = (req, res) => {
  req.session.user = false;
  req.session.admin = false;
  req.session.destroy();
  res.redirect("/admin-login");
};

exports.adminCategory = (req, res) => {
  Category.find().then((result) => {
    if (req.session.editCategory) {
      res.render("admin/category", {
        categories: result,
        editCategory: req.session.editCategory,
      });
    } else {
      res.render("admin/category", {
        categories: result,
        message: req.session.categoryMessage,
      });
    }
  });
};
exports.adminCategoryLoad = (req, res) => {
  Category.find({
    category: req.body.category,
  }).then((result) => {
    if (result.length === 0) {
      const categoryData = new Category(req.body);
      categoryData
        .save()
        .then(() => {
          res.redirect("/admin-category");
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      let message = "the Category aldready exists.";
      req.session.categoryMessage = message;
      res.redirect("/admin-category");
    }
  });
};
exports.categoryDelete = (req, res) => {
  const id = req.query.id;
  Category.deleteOne({ _id: id })
    .then(() => {
      res.redirect("/admin-category");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.categoryEdit = (req, res) => {
  const id = req.query.id;
  Category.findOne({ _id: id }).then((result) => {
    req.session.editCategory = result.category;
    res.redirect("/admin-category");
  });
};

exports.categoryUpdate = (req, res) => {
  const updateText = req.body.categoryUpdate;
  Category.updateOne(
    { category: req.session.editCategory },
    { $set: { category: updateText } }
  )
    .then(() => {
      req.session.editCategory = false;
      res.redirect("/admin-category");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.productLoad = (req, res) => {
  //   Product.find((err,isDeleted) => {
  //     if (!err) {
  //       console.log("product deatils")
  //       req.session.products = products;
  //       res.render("admin/adminProducts", {
  //         products,
  //         adminMessage: req.session.productMessage,
  //       });
  //     } else {
  //       console.log(err.message);
  //     }
  //   });

  Product.find({ isDeleted: false })
    .then((products) => {
      console.log("product deatils");
      req.session.products = products;
      res.render("admin/adminProducts", {
        products,
        adminMessage: req.session.productMessage,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.productAdd = (req, res) => {
  getCategory()
    .then((categories) => {
      res.render("admin/addProduct", { categories });
    })
    .catch(() => {
      console.log(err.message);
    });
};

exports.productUpload = (req, res) => {
  const productData = new Product({
    productName: req.body.name,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    category: req.body.category,
    img1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
    img2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
    isDeleted: false,
  });
  productData
    .save()
    .then(() => {
      let message = "Product added successfully";
      req.session.productMessage = message;
      res.redirect("/admin-product");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.productEdit = (req, res) => {
  const id = req.query.id;
  req.session.productQuery = id;
  Product.findOne({ _id: id })
    .then((result) => {
      getCategory().then((categories) => {
        res.render("admin/editProduct", {
          product: result,
          categories: categories,
        });
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.productUpdate = (req, res) => {
  const id = req.session.productQuery;
  let updateObj = {
    $set: {
      productName: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      isDeleted: false,
    },
  };
  if (req.files[0] && req.files[0].filename) {
    updateObj.$set.img1 = req.files[0].filename;
  }
  if (req.files[1] && req.files[1].filename) {
    updateObj.$set.img2 = req.files[1].filename;
  }
  Product.updateOne({ _id: id }, updateObj)
    .then(() => {
      let message = "Product Updated Successfully";
      req.session.productMessage = message;
      res.redirect("/admin-product");
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.productDelete = (req, res) => {
  const id = req.query.id;
  Product.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    .then((product) => {
      let message = "product was soft deleted Successfully";
      req.session.productMessage = message;
      res.redirect("/admin-product");
    })
    .catch((error) => {
      console.log(error.message);
    });
};
exports.productSearch = (req, res) => {
  const search = req.body.productsearch;
  Product.find({
    $or: [
      { productName: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ],
  })
    .then((result) => {
      if (result) {
        res.render("admin/adminProducts", { products: result });
      } else {
        let message = "product not found";
        req.session.productMessage = message;
        res.redirect("/admin-product");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};
