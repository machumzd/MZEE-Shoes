const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const store = require('../helpers/multer')

router.get('/admin-login',controlls.getAdminLogin)
router.post('/admin-login',controlls.adminLogin)


router.get('/admin-panel/user',controlls.adminLoggedIn,controlls.userManagement)
router.post('/admin-panel/user/search',controlls.userSearch)
router.get('/admin-panel/user/edit',controlls.userEdit)
router.post('/admin-panel/user/edit',controlls.userUpdate)
router.get('/admin-panel/user/delete',controlls.userDelete)
router.get('/admin-panel/user/block',controlls.userBlock)
router.get('/admin-panel/user/unblock',controlls.userUnBlock)


router.get('/admin-category',controlls.adminLoggedIn,controlls.adminCategory)
router.post('/admin-category',controlls.adminCategoryLoad)
router.get('/admin-category/delete',controlls.categoryDelete)
router.get('/admin-category/edit',controlls.categoryEdit)
router.post('/admin-category/update',controlls.categoryUpdate)


router.get('/admin-product',controlls.adminLoggedIn,controlls.productLoad)
router.get('/admin-product/add',controlls.productAdd)
router.post('/admin-product/add',store.any(),controlls.productUpload)
router.get('/admin-product/edit',controlls.productEdit)
router.post('/admin-product/edit',store.any(),controlls.productUpdate)
router.get('/admin-product/delete',controlls.productDelete)
router.post('/admin-product/search',controlls.adminLoggedIn,controlls.productSearch)


router.get('/admin-dashboard',controlls.adminLoggedIn,controlls.userDashboard)




router.get("/admin-logout",controlls.adminLogout)

module.exports=router;