const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const store = require('../helpers/multer')
const auth=require('../middleware/auth')


router.get('/admin',controlls.getAdminLogin)
router.post('/admin',controlls.adminLogin)


router.get('/admin/users',auth.adminLoggedIn,controlls.userManagement)
router.post('/admin/users/search',controlls.userSearch)
router.get('/admin/users/edit',controlls.userEdit)
router.post('/admin/users/edit',controlls.userUpdate)
// router.post('/admin/users/delete',controlls.userDelete)
router.post('/admin/users/block',controlls.userBlock)
router.post('/admin/users/unblock',controlls.userUnBlock)


router.get('/admin/category',auth.adminLoggedIn,controlls.adminCategory)
router.post('/admin/category',controlls.adminCategoryLoad)
router.get('/admin/category/delete',controlls.categoryDelete)
router.get('/admin/category/edit',controlls.categoryEdit)
router.post('/admin/category/update',controlls.categoryUpdate)


router.get('/admin/products',auth.adminLoggedIn,controlls.productLoad)
router.get('/admin/products/add',controlls.productAdd)
router.post('/admin/products/add',store.any(),controlls.productUpload)
router.get('/admin/products/edit',controlls.productEdit)
router.post('/admin/products/edit',store.any(),controlls.productUpdate)
router.post('/admin/products/delete',controlls.productDelete)
router.post('/admin/products/search',auth.adminLoggedIn,controlls.productSearch)

router.get('/admin/orders',auth.adminLoggedIn,controlls.ordersLoad)
router.get('/admin/orders/status',auth.adminLoggedIn,controlls.editStatusLoad)
router.post('/admin/orders/status',controlls.editStatus)

router.get('/admin/dashboard',auth.adminLoggedIn,controlls.userDashboard)
router.get('/admin/coupons',auth.adminLoggedIn,controlls.couponLoad)
router.post('/admin/coupons/add',controlls.couponAdd)
router.get('/admin/coupon/delete',controlls.couponDelete)
router.get("/admin/coupon/edit",controlls.couponEdit)
router.post("/admin/coupon/update",controlls.couponUpdate)

router.get("/admin/dashboard/report",auth.adminLoggedIn,controlls.orderReport)
router.get("/admin/exportExcel",auth.adminLoggedIn,controlls.orderExcel)

router.get("/admin/banner",auth.adminLoggedIn,controlls.bannerLoad)
router.post('/admin/banners/add',store.any(),controlls.bannerAdd)
router.get("/admin/banner/edit",auth.adminLoggedIn,controlls.bannerEdit)
router.post("/admin/banner/update",store.any(),controlls.bannerUpdate)

router.post("/admin/banner/disable",controlls.bannerDisable)
router.post("/admin/banner/enable",controlls.bannerEnable)

router.get("/admin-logout",auth.adminLogout)


module.exports=router;