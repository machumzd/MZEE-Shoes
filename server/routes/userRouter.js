const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const multer=require("multer")


router.get("/",function(req,res){
    res.redirect("/user-home")
})
router.get("/user-signup",controlls.signUp)
router.get("/user-login",controlls.userSignin)
router.get("/user-home",controlls.userHome)
router.get("/user-logout",controlls.userLogout)
router.get("/why",controlls.why)
router.get("/mobile-otp",controlls.mobileOtp)
router.get("/verify-otp",controlls.verifyOtp)
router.get("/displayCategory",controlls.displayCategory)
router.get('/search',controlls.proSearch)
router.get("/productView",controlls.productView)
router.post("/user-home/addtoCart",controlls.userLoggedIn)

router.post("/user-signup",controlls.signUpCheck)
router.post("/user-login",controlls.signIn)
router.post("/sent_otp",controlls.sendOtp)


module.exports=router;