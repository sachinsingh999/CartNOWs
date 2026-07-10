import jwt from 'jsonwebtoken';
const adminAuth=async(req,res,next)=>{
    try {
        const {token}=req.headers;
        if(!token){
            return res.status(401).json({success:false,message:"Not authorized"})
        }
        const token_decode=jwt.verify(token,process.env.JWT_SECRET);
        if(!token_decode || token_decode.role !== "admin" || token_decode.email !== process.env.ADMIN_EMAIL){
            return res.status(401).json({success:false,message:"Not authorized"})
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false,message:error.message})
    }
}
export default adminAuth