import express from 'express'
import { listProducts ,addProducts,removeProduct,singleProduct,addProductReview} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

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
productRouter.get('/single/:id',singleProduct)
productRouter.post('/review/:id',authUser,addProductReview)
productRouter.get('/list',listProducts)

export default productRouter;
