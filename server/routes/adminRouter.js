const express=require("express")
const router=express.Router()
const controlls=require("../controllers/control")
const store = require('../helpers/multer')

router.get('/admin_login',controlls.getAdminLogin)
router.post('/admin_login',controlls.adminLogin)


router.get('/admin_panel/user_management',controlls.adminLoggedIn,controlls.userManagement)
router.post('/admin_panel/user_management/search',controlls.userSearch)
router.get('/admin_panel/user_management/edit',controlls.userEdit)
router.post('/admin_panel/user_management/edit',controlls.userUpdate)
router.get('/admin_panel/user_management/delete',controlls.userDelete)
router.get('/admin_panel/user_management/block',controlls.userBlock)
router.get('/admin_panel/user_management/unblock',controlls.userUnBlock)


router.get('/admin-panel/category-management',controlls.adminLoggedIn,controlls.adminCategory)
router.post('/admin-panel/category-management',controlls.adminCategoryLoad)
router.get('/admin-panel/category-management/delete',controlls.categoryDelete)
router.get('/admin-panel/category-management/edit',controlls.categoryEdit)
router.post('/admin-panel/category-management/update',controlls.categoryUpdate)


router.get('/admin_panel/product_management',controlls.adminLoggedIn,controlls.productLoad)
router.get('/admin_panel/product_management/add',controlls.productAdd)
router.post('/admin_panel/product_management/add',store.any(),controlls.productUpload)
router.get('/admin_panel/product_management/edit',controlls.productEdit)
router.post('/admin_panel/product_management/edit',store.any(),controlls.productUpdate)
router.get('/admin_panel/product_management/delete',controlls.productDelete)
router.post('/admin_panel/product_management/search',controlls.adminLoggedIn,controlls.productSearch)

router.get('/admin_panel/dashboard',controlls.adminLoggedIn,controlls.userDashboard)




router.get("/admin_logout",controlls.adminLogout)

module.exports=router;