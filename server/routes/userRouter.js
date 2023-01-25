const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const multer=require("multer")


router.get("/",function(req,res){
    res.redirect("/user_home")
})
router.get("/user_signup",controlls.signUp)
router.get("/user_signin",controlls.userSignin)
router.get("/user_home",controlls.userHome)
router.get("/user_logout",controlls.userLogout)
router.get("/why",controlls.why)
router.get("/mobile_otp",controlls.mobileOtp)
router.get("/verify_otp",controlls.verifyOtp)
router.get("/displayCategory",controlls.displayCategory)
router.get('/search',controlls.proSearch)
router.get("/productView",controlls.productView)
router.post("/user_home/addtoCart",controlls.userLoggedIn)

router.post("/user_signup",controlls.signUpCheck)
router.post("/user_signin",controlls.signIn)
router.post("/sent_otp",controlls.sendOtp)


module.exports=router;