const twilio = require("twilio");
const config = require("../config/config");
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
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const { log } = require("console");
const { response } = require("express");

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
  const userData = req.session.userData;
  getCategory().then((categories) => {
    if (userData) {
      getCarts(userData._id).then((carts) => {
        res.render("user/why", { categories, userData, cart: carts });
      });
    } else {
      res.render("user/why", { categories, userData });
    }
  });
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

const getCoupons = function () {
  return new Promise((res, rej) => {
    Coupon.find({})
      .then((coupons) => {
        res(coupons);
      })
      .catch(() => {
        const error = new Error("could not find coupons");
        rej(error);
      });
  });
};
const getCarts = function (id) {
  return new Promise((res, rej) => {
    Cart.find({ owner: id })
      .then((carts) => {
        res(carts);
      })
      .catch(() => {
        const error = new Error("could not find Cart");
        rej(error);
      });
  });
};

const getAddress = function (id) {
  return new Promise((res, rej) => {
    Address.find({ owner: id })
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
    res.redirect("/user");
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
      res.redirect("/user");
    }
  } catch (err) {
    req.session.user = false;
    res.render("/login", { message: err.message });
  }
};

exports.userHome = (req, res) => {
  getCategory().then((categories) => {
    getProducts().then((products) => {
      if (req.session.user) {
        userData = req.session.userData;
        getCarts(userData._id).then((carts) => {
          res.render("user/index", {
            userData: userData,
            cart: carts,
            categories: categories,
            products: products,
          });
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
    res.redirect("/login");
  }
};
exports.userLogout = (req, res) => {
  req.session.user = false;
  req.session.destroy();
  res.redirect("/user");
};

exports.mobileOtp = (req, res) => {
  res.render("user/mobileOtp");
};

exports.sendOtp = (req, res) => {
  mobile = req.body.mobile;
  if (mobile.length == 10 && mobile != "") {
    const OTP = generateOTP();
    sendOTP(mobile, OTP);
    User.updateOne({ mobile: mobile }, { $set: { token: OTP } })

      .then(() => {
        req.session.verifypage = true;
        res.render("user/otpVerify");
      })
      .catch((error) => console.log(error));
  } else {
    const message = "fields cannot empty";
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
              res.redirect("/user");
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
        console.log("in verify page");
        const otp = req.query.otp;
        User.findOne({ token: otp })
          .then((result) => {
            if (result) {
              if (req.session.changePassword) {
                console.log("in change password");
                res.render("user/changePassword");
              } else {
                req.session.userData = result;
                req.session.user = true;
                res.redirect("/user");
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
          const userData = req.session.userData;
          getCarts(userData._id).then((carts) => {
            res.render("user/shop.hbs", {
              products,
              cart: carts,
              categoryName: category,
              userData: userData,
              categories: categories,
            });
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
  const name = req.query.name;
  console.log("this is id:" + req.query.id);
  Product.findOne({ $or: [{ _id: id }, { productName: name }] }).then(
    (productDetails) => {
      getCategory().then((categories) => {
        if (req.session.userData) {
          getCarts(req.session.userData._id).then((carts) => {
            res.render("user/productView", {
              categories: categories,
              cart: carts,
              userData: req.session.userData,
              product: productDetails,
            });
          });
        } else {
          res.render("user/productView", {
            categories: categories,
            userData: req.session.userData,
            product: productDetails,
          });
        }
      });
    }
  );
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
      const message = "Address Added Successfully";
      req.session.successMessage = message;
      req.session.errorMessage = "";
      req.query.add = false;
      res.redirect("/profile");
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
      const message = "Address Updated Successfully";
      req.session.successMessage = message;
      req.session.errorMessage = "";
      res.redirect("/profile");
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
            const message = "Password is incorrect";
            req.session.errorMessage = message;
          }
          return bcrypt
            .compare(req.body.currPass, user.password)
            .then((passwordMatch) => {
              if (!passwordMatch) {
                const message = "Previous Password is Incorrect";
                req.session.errorMessage = message;
                req.session.successMessage = "";
                res.redirect("/profile?passEdit=true");
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
                        const message = "Password changed Successfully";
                        req.session.user = true;
                        req.session.successMessage = message;
                        req.session.errorMessage = "";
                        res.redirect("/profile");
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
      const message = "Passwords are not match";
      req.session.errorMessage = message;
      req.session.successMessage = "";
      res.redirect("/profile?passEdit=true");
    }
  } else {
    const message = "password and fields dont be blank";
    req.session.errorMessage = message;
    req.session.successMessage = "";
    res.redirect("/profile?passEdit=true");
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
              const message =
                "Profile edited Successfully,(reflects madeby after login)";
              req.session.userData = result;
              req.session.successMessage = message;
              req.session.errorMessage = "";
              res.redirect("/profile");
            })
            .catch((err) => {
              console.log("profile can't updated" + err);
            });
        } else {
          const message = "Credintial's will be aldready Taken";
          req.session.errorMessage = message;
          req.session.successMessage = "";
          res.redirect("/profile?userEdit=true");
        }
      })
      .catch((err) => {
        console.log("user result not found" + err);
      });
  }
};

//cart
exports.cart = (req, res) => {
  const userData = req.session.userData;
  const id = req.query.id;
  const cartMessage = req.session.cartMessage;
  getCategory().then((categories) => {
    Cart.find({ owner: id }).then((cart) => {
      if (cart.length == 0 || !cart) {
        res.render("user/cart", {
          cart,
          categories,
          cartBill: 0,
          userData,
          message: cartMessage,
        });
      } else {
        getTotalSum(id).then((result) => {
          req.session.cartBill = result;
          res.render("user/cart", {
            cart,
            categories,
            cartBill: result,
            userData,
            message: cartMessage,
          });
        });
      }
    });
  });
};

exports.addToCart = (req, res) => {
  const id = req.query.id;
  const userData = req.session.userData;

  if (userData) {
    Product.findOne({
      _id: id,
    }).then((result) => {
      Cart.findOne({ productName: result.productName }).then((cart) => {
        if (!cart) {
          const cartAdd = new Cart({
            owner: userData._id,
            productId: result._id,
            productName: result.productName,
            price: result.price,
            category: result.category,
            quantity: 1,
            bill: result.price,
            img1: result.img1,
            orderStatus: "pending",
          });
          cartAdd
            .save()
            .then((cartData) => {
              res.redirect(`/productView?id=${result._id}`);
            })
            .catch((err) => {
              console.log("cannot get cart" + err);
            });
        } else {
          Cart.updateOne(
            { _id: cart._id },
            { $inc: { quantity: 1, bill: result.price } }
          ).then((updatedCart) => {
            res.redirect(`/productView?id=${result._id}`);
          });
        }
      });
    });
  } else {
    res.redirect("/login");
  }
};

exports.deleteCart = (req, res) => {
  const userData = req.session.userData;
  const id = req.query.id;
  console.log("the id is " + req.query.id);
  Cart.deleteOne({ _id: id })
    .then((result) => {
      const message = "cart deleted Successfully";
      req.session.cartMessage = message;
      res.redirect(`cart?id=${userData._id}`);
    })
    .catch((err) => {
      console.log("cant delete" + err);
    });
};

exports.emailOtp = (req, res) => {
  const enteredEmail = req.body.email;
  const OTP = generateOTP();
  if (enteredEmail != "") {
    User.findOneAndUpdate({ email: enteredEmail }, { $set: { token: OTP } })
      .then((result) => {
        if (result) {
          req.session.userId = result._id;
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
            text: `DO NOT SHARE: Your Mzee OTP is ${OTP}.`,
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
  } else if (enteredEmail == "") {
    res.render("user/emailOtp", { message: "fields are not be null" });
  } else {
    res.render("user/emailOtp", { message: "incorrect credintials" });
  }
};

exports.sendEmailOtp = (req, res) => {
  res.render("user/emailOtp");
};

exports.verifyPassword = (req, res) => {
  console.log("in verify pass");
  const password = req.body.password;
  const cPassword = req.body.cPassword;
  const id = req.session.userId;
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
              req.session.user = false;
              res.redirect("/login");
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
      res.render("user/verifyOtp", { message: "the passwords are not match" });
    }
  }
};

exports.cartOperation = (req, res) => {
  console.log("----------------------im in operation");
  const userData = req.session.userData;
  req.session.cartMessage = "";

  Cart.findOne({ owner: userData._id })
    .then((cart) => {
      if (!cart) {
        return res.redirect(`/cart?id=${userData._id}`);
      } else {
        if (req.body.add) {
          console.log("req body=-------" + req.body.id);
          const id = req.body.id;
          const price = parseInt(req.body.price);
          Cart.findOneAndUpdate(
            {
              _id: id,
            },
            {
              $inc: {
                quantity: 1,
                bill: price,
              },
            },
            { new: true }
          ).then((response) => {
            res.json(response);

            // return res.redirect(`/cart?id=${userData._id}`);
          });
        }

        if (req.body.sub) {
          const id = req.body.id;
          const price = req.body.price;
          Cart.findOneAndUpdate(
            { _id: id },
            {
              $inc: { quantity: -1, bill: -price },
            }
          ).then(() => {
            res.json(response);
          });
        }
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send("Internal server error");
    });
};

const getTotalSum = function (id) {
  return new Promise((res, rej) => {
    Cart.find({ owner: id }).then((result) => {
      if (result == null) {
        constsum = 0;
        res(sum);
      } else {
        Cart.aggregate([
          {
            $match: {
              owner: id,
            },
          },
          {
            $group: {
              _id: "$owner",
              total: {
                $sum: "$bill",
              },
            },
          },
        ])
          .exec()
          .then((sum) => {
            res(sum[0].total);
          });
      }
    });
  });
};
exports.checkout = (req, res) => {
  const userData = req.session.userData;
  getCategory().then((categories) => {
    Cart.find({ owner: userData._id }).then((cart) => {
      if (cart.length == 0) {
        res.redirect("/cart");
      } else {
        getAddress(userData._id).then((address) => {
          if (req.session.user) {
            getTotalSum(userData._id).then((totalBill) => {
              res.render("user/checkout", {
                userData,
                address,
                categories,
                totalBill,
                cart,
              });
            });
          } else {
            res.redirect("/login");
          }
        });
      }
    });
  });
};

exports.paymentLoad = (req, res) => {
  req.session.selectedAddressIndex = req.body.selectedAddressIndex;
  res.redirect(`/cart/checkout/payment?index=${req.body.selectedAddressIndex}`);
};

exports.payment = (req, res) => {
  const selectedAddress = req.query.index;
  const userData = req.session.userData;
  req.session.selectedAddress = selectedAddress;
  getCategory().then((categories) => {
    Cart.find({ owner: userData._id }).then((cart) => {
      if (cart.length == 0) {
        res.redirect("/cart");
      } else {
        getTotalSum(userData._id).then((totalBill) => {
          console.log("this is frorm ------payment" + req.session.couponCode);

          res.render("user/payment", {
            categories,
            coupon: req.session.couponCode,
            selectedAddress,
            cart,
            userData,
            totalBill,
          });
        });
      }
    });
  });
};

exports.paymentMode = (req, res) => {
  console.log("in function");
  const userData = req.session.userData;

  function createOrders(cart, paymentMode, address, orderBill) {
    const newOrder = {
      owner: cart[0].owner,
      address: address,
      items: cart,
      paymentMode: paymentMode,
      orderBill: orderBill,
      orderDate: Date(),
    };
    req.session.order = newOrder;
  }

  Cart.find({ owner: userData._id }).then((cart) => {
    const address = req.session.selectedAddress;
    const paymentMode = req.body.radio;
    const orderBill = req.session.cartBill;
    Address.findOne({ _id: address }).then((address) => {
      if (paymentMode == "COD") {
        console.log("in function going section");
        createOrders(cart, paymentMode, address, orderBill);
        res.json({ codSuccess: true });
      }
    });
  });
};

exports.orderSuccessRedirect = (req, res) => {
  const order = req.session.order;
  order.items.forEach((item) => {
    item.orderStatus = "processed";
  });
  const newOrder = new Order(order);
  newOrder
    .save()
    .then(() => {
      Cart.deleteMany({ owner: newOrder.owner }).then(() => {
        if (req.session.applyedCoupon) {
          const applyedCoupon = req.session.applyedCoupon;
          console.log("--------------------coupon applied-------");
          Coupon.findOneAndUpdate(
            { _id: applyedCoupon._id },
            { $set: { status: "Applied" } }
          ).then((coupon) => {
            const final =
              newOrder.orderBill - (newOrder.orderBill * coupon.value) / 100;
            console.log("-------------------------final-----------" + final);
            Order.updateOne(
              { _id: newOrder._id },
              { $set: { orderBill: final } }
            ).then(() => {
              res.redirect("/orderSuccess");
              console.log("success guys");
            });
          });
        } else {
          res.redirect("/orderSuccess");
          console.log("success guys");
        }
      });
    })
    .catch((err) => {
      console.log("cant render order success" + err);
    });
};

exports.orderSuccess = (req, res) => {
  res.render("user/orderSuccess");
};

exports.orders = async (req, res) => {
  const userData = req.session.userData;

  getCategory().then(async (categories) => {
    const data = await Order.find({ owner: req.session.userData._id }).lean();

    res.render("user/orders", { data, userData, categories });
  });
};

exports.cancelOrder = (req, res) => {
  const userData = req.session.userData;
  const id = req.body.id;
  Order.findOneAndUpdate(
    {
      owner: userData._id,
      "items._id": id,
    },
    { $set: { "items.$.orderStatus": "Cancelled" } }
  ).then((result) => {
    Product.findOneAndUpdate(
      { _id: result.items[0].productId },
      { $inc: { stock: result.items[0].quantity } }
    ).then((response) => {
      res.json(response);
    });
  });
};

exports.returnOrder = (req, res) => {
  const userData = req.session.userData;
  const id = req.query.id;
  Order.findOneAndUpdate(
    {
      owner: userData._id,
      "items._id": id,
    },
    { $set: { "items.$.orderStatus": "Return initiated" } }
  ).then((result) => {
    Product.findOneAndUpdate(
      { _id: result.items[0].productId },
      { $inc: { stock: result.items[0].quantity } }
    ).then(() => {
      res.redirect("/orders?user=true");
    });
  });
};

exports.applyCoupon = (req, res) => {
  const code = req.body.coupon;
  const bill = req.body.bill;

  Coupon.findOne({ code: code }).then((coupon1) => {
    if (coupon1) {
      const coupDate = new Date(coupon1.expiryDate);
      const currDate = new Date();
      const status = currDate.getTime() > coupDate.getTime() ? "Expired" : "Active";
      
      console.log("-------------------insidee of coupo1--------");
      Coupon.findOneAndUpdate(
        { code: code },
        { $set: { status: status } }
      ).then((coupon3) => {
        console.log("---------------------inside of coupon3---"+coupon3.code)
        Coupon.findOne({ code: code }) //extra validation
          .then((Vcoupon) => {
            console.log("-----------------------inside of vcoupon----------"+bill,Vcoupon.minBill)

            if (Vcoupon.minBill < bill) {
              req.session.applyedCoupon = Vcoupon;
            }
            res.json(coupon1);
          });
      });
    } else {
      res.json(307);
    }
  });
};

///admin-----------------------------------------------------------------------------------------------------
exports.getAdminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
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
        res.redirect("/admin/dashboard");
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
    res.redirect("/admin");
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
        const message = "User not found";
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
  req.session.adminMessage = "";
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
  req.session.adminMessage = "";
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
      const message = "User Updated successfully";
      req.session.adminMessage = message;
      res.redirect("/admin/users");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

// exports.userDelete = (req, res) => {
//   const id = req.body.id;
//   req.session.adminMessage = "";
//   User.deleteOne({ _id: id }).then((response) => {
//     const message = "User Deleted Successfully";
//     req.session.adminMessage = message;
//     res.json(response)
//     res.redirect("/admin/users");
//   });
// };
exports.userDashboard = (req, res) => {
  res.render("admin/adminDashboard");
};
exports.userBlock = (req, res) => {
  const id = req.body.id;
  req.session.adminMessage = "";
  User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } })
    .then((response) => {
      const message = "User Blocked Successfully";
      req.session.adminMessage = message;
      res.json(response);
      res.redirect("/admin/users");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.userUnBlock = (req, res) => {
  const id = req.body.id;
  req.session.adminMessage = "";
  User.findOneAndUpdate({ _id: id }, { $set: { blockStatus: false } })
    .then((response) => {
      const message = "User unBlocked Successfully";
      req.session.adminMessage = message;
      res.json(response);
      res.redirect("/admin/users");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.adminLogout = (req, res) => {
  req.session.user = false;
  req.session.admin = false;
  req.session.destroy();
  res.redirect("/admin");
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
  if (req.body.category != "") {
    Category.find({
      category: req.body.category,
    }).then((result) => {
      if (result.length === 0) {
        req.session.categoryMessage = "";
        const categoryData = new Category(req.body);
        categoryData
          .save()
          .then(() => {
            res.redirect("/admin/category");
          })
          .catch((err) => {
            console.log(err.message);
          });
      } else {
        const message = "The Category aldready exists.";
        req.session.categoryMessage = message;
        res.redirect("/admin/category");
      }
    });
  } else {
    const message = "The Category field don't be null";
    req.session.categoryMessage = message;
    res.redirect("/admin/category");
  }
};
exports.categoryDelete = (req, res) => {
  const id = req.query.id;
  Category.deleteOne({ _id: id })
    .then(() => {
      res.redirect("/admin/category");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.categoryEdit = (req, res) => {
  const id = req.query.id;
  Category.findOne({ _id: id }).then((result) => {
    req.session.editCategory = result.category;
    res.redirect("/admin/category");
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
      res.redirect("/admin/category");
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
    bgColor: req.body.bgcolor,
    img1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
    img2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
    isDeleted: false,
  });
  productData
    .save()
    .then(() => {
      const message = "Product added successfully";
      req.session.productMessage = message;
      res.redirect("/admin/products");
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
  const updateObj = {
    $set: {
      productName: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      bgColor: req.body.bgcolor,
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
      const message = "Product Updated Successfully";
      req.session.productMessage = message;
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.productDelete = (req, res) => {
  const id = req.body.id;
  Product.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    .then((response) => {
      console.log(response);
      const message = "product was soft deleted Successfully";
      req.session.productMessage = message;
      res.json(response);
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
        const message = "product not found";
        req.session.productMessage = message;
        res.redirect("/admin/products");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.ordersLoad = (req, res) => {
  Order.find({}).then((orders) => {
    res.render("admin/adminOrders", { orders });
  });
};

exports.editStatusLoad = (req, res) => {
  const id = req.query.id;
  req.session.order2Id = id;
  Order.find({ _id: id }).then((orders) => {
    res.render("admin/editOrderStatus", { orders });
  });
};

exports.editStatus = (req, res) => {
  console.log("order id========" + req.session.order2Id);
  console.log("approve id===========" + req.query.orderId);
  const order2Id = req.session.order2Id;
  if (req.query.approve) {
    const id = req.query.orderId;
    Order.findOneAndUpdate(
      {
        _id: order2Id,
        "items._id": id,
      },
      { $set: { "items.$.orderStatus": "Approved" } }
    )
      .then(() => {
        console.log("product succesfuly changed");
        res.redirect(`/admin/orders/status?id=${order2Id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (req.query.deny) {
    const id = req.query.ordeId;
    Order.findOneAndUpdate(
      {
        _id: order2Id,
        "items._id": id,
      },
      { $set: { "items.$.orderStatus": "Cancelled" } }
    )
      .then(() => {
        res.redirect(`/admin/orders/status?id=${order2Id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (req.query.shipped) {
    const id = req.query.orderId;
    Order.findOneAndUpdate(
      {
        _id: order2Id,
        "items._id": id,
      },
      { $set: { "items.$.orderStatus": "Shipped" } }
    )
      .then(() => {
        res.redirect(`/admin/orders/status?id=${order2Id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (req.query.delivered) {
    const id = req.query.orderId;
    const itemId = req.query.itemId;
    console.log("item id....." + itemId);
    Order.findOneAndUpdate(
      {
        _id: order2Id,
        "items._id": id,
      },
      { $set: { "items.$.orderStatus": "Delivered" } }
    )
      .then((result) => {
        console.log("result--------" + result.items[0].quantity);
        Product.updateOne(
          { _id: itemId },
          {
            $inc: { stock: -result.items[0].quantity },
          }
        ).then(() => {
          res.redirect(`/admin/orders/status?id=${order2Id}`);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect(`/admin/orders/status?id=${order2Id}`);
  }
};

exports.couponLoad = (req, res) => {
  Coupon.find({}).then((coupon) => {
    if (coupon) {
      if (req.query.edit) {
        Coupon.findOne({ _id: req.query.edit }).then((edit) => {
          res.render("admin/coupons", { couponEdit: edit, coupon });
        });
      } else {
        req.query.edit = false;
        const message = req.session.couponMessage;
        const errorMessage = req.session.couponErrMessage;
        res.render("admin/coupons", { coupon, message, errorMessage });
      }
    } else {
      res.render("admin/coupons");
    }
  });
};

exports.couponAdd = (req, res) => {
  req.session.couponMessage = "";
  const code = req.body.couponCode;
  const value = req.body.couponValue;
  const expiry = req.body.couponExpiry;
  const bill = req.body.minBill;
  if (code != "" && value != "" && expiry != "" && bill != "") {
    if (value > 0 && value <= 100) {
      const couponData = new Coupon({
        code: code,
        value: value,
        minBill: bill,
        expiryDate: Date(),
        status: "Active",
      });

      couponData.save().then((coupon) => {
        req.session.couponErrMessage = "";
        const message = "new Coupon Added Successfully";
        req.session.couponErrMessage = message;
        res.redirect("/admin/coupons");
      });
    } else {
      req.session.couponMessage = "";
      req.session.couponErrMessage = "coupon Value(0-100 only)";
      res.redirect("/admin/coupons");
    }
  } else {
    req.session.couponMessage = "";
    req.session.couponErrMessage = "fields dont be null";
    res.redirect("/admin/coupons");
  }
};

exports.couponDelete = (req, res) => {
  const id = req.query.id;
  Coupon.deleteOne({ _id: id }).then(() => {
    req.session.couponErrMessage = "";
    const message = "coupon Deleted Successfully";
    req.session.couponMessage = message;
    res.redirect("/admin/coupons");
  });
};

exports.couponEdit = (req, res) => {
  const id = req.query.id;
  res.redirect(`/admin/coupons?edit=${id}`);
};
exports.couponUpdate = (req, res) => {
  const id = req.query.id;
  const code = req.body.couponCode;
  const value = req.body.couponValue;
  const expiry = new Date(req.body.couponExpiry);
  const bill = req.body.minBill;
  const currDate = new Date();

  const status = currDate.getTime() < expiry.getTime() ? "Active" : "Expired";

  Coupon.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        code: code,
        value: value,
        expiryDate: expiry,
        minBill: bill,
        status: status,
      },
    }
  )
    .then(() => {
      res.redirect("/admin/coupons");
    })
    .catch((error) => {
      console.error(error);
      res.send("An error occurred while updating the coupon.");
    });
};
