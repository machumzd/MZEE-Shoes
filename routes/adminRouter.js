const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const store = require('../helpers/multer')

router.get('/admin',controlls.getAdminLogin)
router.post('/admin',controlls.adminLogin)


router.get('/admin/users',controlls.adminLoggedIn,controlls.userManagement)
router.post('/admin/users/search',controlls.userSearch)
router.get('/admin/users/edit',controlls.userEdit)
router.post('/admin/users/edit',controlls.userUpdate)
// router.post('/admin/users/delete',controlls.userDelete)
router.post('/admin/users/block',controlls.userBlock)
router.post('/admin/users/unblock',controlls.userUnBlock)


router.get('/admin/category',controlls.adminLoggedIn,controlls.adminCategory)
router.post('/admin/category',controlls.adminCategoryLoad)
router.get('/admin/category/delete',controlls.categoryDelete)
router.get('/admin/category/edit',controlls.categoryEdit)
router.post('/admin/category/update',controlls.categoryUpdate)


router.get('/admin/products',controlls.adminLoggedIn,controlls.productLoad)
router.get('/admin/products/add',controlls.productAdd)
router.post('/admin/products/add',store.any(),controlls.productUpload)
router.get('/admin/products/edit',controlls.productEdit)
router.post('/admin/products/edit',store.any(),controlls.productUpdate)
router.post('/admin/products/delete',controlls.productDelete)
router.post('/admin/products/search',controlls.adminLoggedIn,controlls.productSearch)


router.get('/admin/orders',controlls.ordersLoad)
router.get('/admin/orders/status',controlls.editStatusLoad)
router.post('/admin/orders/status',controlls.editStatus)



router.get('/admin/dashboard',controlls.adminLoggedIn,controlls.userDashboard)
router.get('/admin/coupons',controlls.couponLoad)
router.post('/admin/coupons/add',controlls.couponAdd)
router.get('/admin/coupon/delete',controlls.couponDelete)
router.get("/admin/coupon/edit",controlls.couponEdit)
router.post("/admin/coupon/update",controlls.couponUpdate)

router.get("/admin-logout",controlls.adminLogout)

module.exports=router;