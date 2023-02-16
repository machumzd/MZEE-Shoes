const express = require("express");
const router = express.Router();
const controlls = require("../controllers/control");
const auth=require("../middleware/auth")

router.get("/", function (req, res) {
  if (req.session.user || req.session.admin) {
    res.redirect("/user");
  } else {
    res.redirect("/user");
  }
});

router.get("/signup", controlls.signUp);
router.get("/login",controlls.userSignin);
router.get("/user", controlls.userHome);
router.get("/logout", auth.userLogout);
router.get("/why", controlls.why);
router.get("/otp", controlls.mobileOtp);
router.get("/otpVerify", controlls.verifyOtp);

router.get("/displayCategory", controlls.displayCategory);
router.get("/search", controlls.proSearch);
router.get("/productView", controlls.productView);
router.post("/user/addtoCart", controlls.addToCart); 
router.get("/cart",auth.userLoggedIn,controlls.cart);
router.post("/deleteFromCart", controlls.deleteCart);
router.get("/cart/checkout",auth.userLoggedIn,controlls.checkout);
router.get("/cart/checkout/payment",auth.userLoggedIn, controlls.payment);
router.post("/cart/checkout/payment", controlls.paymentLoad);
router.post("/cart/checkout/paymentMode", controlls.paymentMode);
router.post("/applyCoupon",controlls.applyCoupon)
router.get("/orderRedirect",auth.userLoggedIn,controlls.orderSuccessRedirect);
router.get("/orders",auth.userLoggedIn,controlls.orders);//dont forget to add auth.userLoggedIn
router.get("/orderSuccess",auth.userLoggedIn,controlls.orderSuccess)
router.post("/orderSearch",controlls.orderSearch)
router.get("/wishlist",auth.userLoggedIn,controlls.wishlist)

router.post("/wishlist/add",controlls.addToWishlist)
router.post("/wishlist/delete",controlls.deleteWishlist)

router.get("/forgotPassword", controlls.sendEmailOtp);
router.post("/forgotPassword", controlls.emailOtp);
router.post("/verifyPassword", controlls.verifyPassword);

router.get("/profile",auth.userLoggedIn, controlls.userProfile);
router.post("/profile/addAddress", controlls.userAddress);
router.post("/profile/uploadAddress", controlls.uploadAddress);
router.get("/profile/deleteAddress",auth.userLoggedIn,controlls.deleteAddress)
router.post("/profile/changePassword", controlls.changePassword);
router.post("/profile/userEdit", controlls.uploadUser);
router.post("/addToCart/operation", controlls.cartOperation);
router.get("/razorpay",auth.userLoggedIn,controlls.razorpayRedirect)

router.post("/cancelOrder",controlls.cancelOrder)
router.post("/returnOrder",controlls.returnOrder)

router.post("/signup", controlls.signUpCheck);
router.post("/login", controlls.signIn);
router.post("/otp", controlls.sendOtp);

module.exports = router;
