import express from 'express'
import {
  listProducts,
  addProducts,
  removeProduct,
  singleProduct,
  addProductReview,
  updateStock,
  generateDescription,
  getCategoriesPublic,
  getCategoryTemplatePublic,
  getCollectionsPublic,
  getBrandsPublic,
  trackProductViewApi,
  getHomepageData,
  getSearchSuggestions
} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser, { authUserOptional } from '../middleware/auth.js';

const productRouter=express.Router();
productRouter.post(
  '/add',
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]),
  adminAuth,
  addProducts
);

productRouter.post('/remove',adminAuth,removeProduct)
productRouter.post('/update-stock',adminAuth,updateStock)
productRouter.post('/generate-description',adminAuth,generateDescription)
productRouter.get('/single/:id',authUserOptional,singleProduct)
productRouter.post('/review/:id',authUser,addProductReview)
productRouter.get('/list',listProducts)
productRouter.get('/',listProducts)
productRouter.get('/categories', getCategoriesPublic)
productRouter.get('/collections', getCollectionsPublic)
productRouter.get('/brands', getBrandsPublic)
productRouter.get('/category/:id/template', getCategoryTemplatePublic)
productRouter.get('/homepage', authUserOptional, getHomepageData)
productRouter.post('/track-view', authUserOptional, trackProductViewApi)
productRouter.get('/search-suggestions', getSearchSuggestions)

export default productRouter;

