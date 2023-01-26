const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const multer=require("multer")


router.get("/",function(req,res){
    if(req.session.user){
        res.redirect("/user-home")
    }else{
        res.redirect("/user-home")
    }
    
    if(req.session.admin){
        res.redirect("/admin-home")
    }else{
        res.redirect("/admin-login")
    }
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
router.post("/user-home/addtoCart")//controlls.userLoggedIn


router.post("/user-profile/addAddress",controlls.userAddress)
router.post("/user-profile/uploadAddress",controlls.uploadAddress)
router.post("/user-profile/changePassword",controlls.changePassword)

router.get("/user-profile",controlls.userProfile)
router.post("/user-signup",controlls.signUpCheck)
router.post("/user-login",controlls.signIn)
router.post("/sent_otp",controlls.sendOtp)


module.exports=router;