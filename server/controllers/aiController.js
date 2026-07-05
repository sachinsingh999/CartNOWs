import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";



// Build a short product context string for Gemini
const buildProductContext = (products) => {
  return products
    .slice(0, 60) // limit tokens
    .map((p) =>
      `- Name: ${p.name} | Category: ${p.category || "N/A"} | Collection: ${p.collection || "N/A"} | Price: ₹${p.price} | Brand: ${p.brand || "N/A"} | Sizes: ${(p.sizes || []).join(", ") || "N/A"} | Stock: ${p.stock > 0 ? "In Stock" : "Out of Stock"} | ID: ${p._id}`
    )
    .join("\n");
};

const SYSTEM_PROMPT = `You are a helpful and friendly shopping assistant for CartNOW, a fashion e-commerce store.
You help customers find the right products, suggest outfits, compare items, answer questions about sizes and availability, and guide them through the buying process.

Here are the available products in our catalog:
{PRODUCT_CONTEXT}

Rules:
- Always be concise, warm, and helpful.
- When recommending a product, mention its name and price.
- If a user asks to "show" or "find" something, recommend 1-3 relevant products from the list above.
- If a product is Out of Stock, mention it clearly.
- Never make up products not in the list.
- If the user asks about something outside fashion/shopping, politely redirect them.
- Format responses cleanly — use short bullet points when listing products.
- Keep replies under 150 words unless the user asks for detail.`;

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.json({ success: false, message: "Message is required" });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.json({
        success: true,
        reply: "AI Assistant is not configured yet. Please add GEMINI_API_KEY to your .env file.",
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    // Fetch products for context
    const products = await productModel.find({}).lean();
    const productContext = buildProductContext(products);
    const systemPrompt = SYSTEM_PROMPT.replace("{PRODUCT_CONTEXT}", productContext);

    // Build conversation contents for Gemini
    const contents = [];

    // Add history (max last 6 messages to avoid token overflow)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      throw new Error(data?.error?.message || "Gemini API error");
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that. Please try again.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.json({
      success: true,
      reply: "I'm having trouble connecting right now. Please try again in a moment! 🛍️",
    });
  }
};

const CLASSIFY_SYSTEM_PROMPT = `You are a professional catalog classification engine.
Given a product name, description, brand, specifications, and price:
1. Determine the best matching standard category (e.g. 'Electronics', 'Fashion', 'Beauty', 'Furniture', 'Sports', 'Gaming', 'Books', 'Home & Kitchen', 'Accessories', 'Groceries'). If it does not fit any, suggest a new category name (e.g. 'Drones').
2. Suggest a specific subcategory name.
3. Suggest a target audience ('Men', 'Women', 'Kids', 'Unisex').
4. Recommend list of existing collections (such as 'Trending Now', 'Best Sellers', 'New Arrivals', 'Gaming Setup', 'Student Essentials', 'Festival Offers', 'Luxury Picks', 'Work From Home', 'Photography Essentials', 'Sports Essentials') or suggest a new relevant collection if it is highly specific.
5. Generate a list of search keywords (lowercase, no spaces, e.g. "samsung", "smartphone").
6. Generate a list of search tags.
7. Perform quality check controls to flag potential duplicates, spam titles, fake brands, inappropriate contents, unrealistic pricing, or empty descriptions.

You MUST respond strictly in the following JSON format:
{
  "category": "Category Name",
  "subCategory": "Subcategory Name",
  "audience": "Unisex | Men | Women | Kids",
  "collections": ["Collection 1", "Collection 2"],
  "keywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2"],
  "qualityChecks": {
    "isDuplicate": false,
    "isSpamTitle": false,
    "isFakeBrand": false,
    "isInappropriateContent": false,
    "isPricingUnrealistic": false,
    "flags": ["Warning message 1", "Warning message 2"]
  }
}`;

const cleanJson = (text) => {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json/i, "");
  cleaned = cleaned.replace(/^```/i, "");
  cleaned = cleaned.replace(/```$/i, "");
  return cleaned.trim();
};

export const classifyProduct = async (req, res) => {
  try {
    const { name, description, brand, price, stock, specifications, tags } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Product name and description are required for classification." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Fallback response if Gemini is not configured
      return res.json({
        success: true,
        fallback: true,
        category: "Electronics",
        subCategory: "Gadgets",
        audience: "Unisex",
        collections: ["Trending Now", "New Arrivals"],
        keywords: [name.toLowerCase().split(" ")[0] || "product"],
        tags: [brand?.toLowerCase() || "general"],
        qualityChecks: {
          isDuplicate: false,
          isSpamTitle: false,
          isFakeBrand: false,
          isInappropriateContent: false,
          isPricingUnrealistic: false,
          flags: ["AI not configured. Using standard default suggestions."]
        }
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    const inputData = {
      name,
      description,
      brand: brand || "",
      price: price || 0,
      stock: stock || 0,
      specifications: specifications || [],
      tags: tags || []
    };

    const prompt = `Classify this product:\n${JSON.stringify(inputData, null, 2)}`;

    const body = {
      system_instruction: {
        parts: [{ text: CLASSIFY_SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini classification error:", data);
      throw new Error(data?.error?.message || "Gemini classification API error");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini classifier");
    }

    const cleanedText = cleanJson(rawText);
    const result = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Classification error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI classification failed: " + error.message
    });
  }
};

export const parseTextProduct = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Text is required for parsing." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.json({
        success: true,
        fallback: true,
        name: text.split("\n")[0] || "Sample Product",
        brand: "",
        price: 0,
        stock: 0,
        description: text,
        category: "Electronics",
        subCategory: "Gadgets",
        audience: "Unisex",
        collections: ["Trending Now"],
        tags: ["pasted"],
        keywords: ["pasted"],
        specifications: []
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    const systemPrompt = `You are a professional product parser and AI classification engine.
Given raw product information (which could be product descriptions, specs, key-value pairs, lists, website details, or brochures):
1. Extract or generate the following fields:
   - name (Product Name, e.g., 'OPPO Reno 14 5G')
   - brand (Brand name, e.g., 'OPPO')
   - price (Price as a number, if specified, otherwise 0. E.g. 32999)
   - stock (Stock as a number, if specified, otherwise 0. E.g. 50)
   - description (A detailed, appealing description of the product. Fill with standard details if not specified)
   - specifications (A clean array of key-value objects, e.g. [{"key": "RAM", "value": "12GB"}, {"key": "Storage", "value": "256GB"}]. Convert variants like "12GB RAM" or "RAM: 12GB" into clean key-value pairs)
   - category (Determine the best matching standard category from: 'Electronics', 'Fashion', 'Beauty', 'Furniture', 'Sports', 'Gaming', 'Books', 'Home & Kitchen', 'Accessories', 'Groceries', or suggest a new relevant category)
   - subCategory (Suggest a specific subcategory name)
   - audience (Suggest 'Unisex', 'Men', 'Women', 'Kids')
   - collections (Suggest matching collections from: 'Trending Now', 'Best Sellers', 'New Arrivals', 'Gaming Setup', 'Student Essentials', 'Festival Offers', 'Luxury Picks', 'Work From Home', 'Photography Essentials', 'Sports Essentials', or suggest a new relevant collection if highly specific)
   - tags (Generate relevant search tags as a list of strings)
   - keywords (Generate relevant search keywords as a list of strings)
   
You MUST respond strictly in the following JSON format:
{
  "name": "Product Name",
  "brand": "Brand",
  "price": 32999,
  "stock": 50,
  "description": "Product description",
  "category": "Category Name",
  "subCategory": "Subcategory Name",
  "audience": "Unisex | Men | Women | Kids",
  "collections": ["Collection 1", "Collection 2"],
  "tags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"],
  "specifications": [{"key": "Key", "value": "Value"}]
}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini parse error:", data);
      throw new Error(data?.error?.message || "Gemini parsing API error");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini parser");
    }

    const cleanedText = cleanJson(rawText);
    const result = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Text parsing error:", error.message);
    res.status(500).json({ success: false, message: "AI text parsing failed: " + error.message });
  }
};

export const enrichProduct = async (req, res) => {
  try {
    const { productData } = req.body;
    if (!productData) {
      return res.status(400).json({ success: false, message: "Product data is required for enrichment." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.json({
        success: true,
        fallback: true,
        ...productData,
        category: productData.category || "Electronics",
        subCategory: productData.subCategory || "Gadgets",
        audience: productData.audience || "Unisex",
        collections: productData.collections || ["Trending Now"],
        tags: productData.tags || ["enriched"],
        keywords: productData.keywords || ["enriched"],
        description: productData.description || "Enriched product description."
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    const systemPrompt = `You are a professional product catalog enrichment engine.
You will receive a partially filled product JSON object.
Your task is to:
1. Preserve all non-empty fields provided in the input (e.g., name, price, stock, description, brand, specifications, etc.). If price or stock is 0/empty, you can try to infer a realistic one if name suggests it, or keep it 0.
2. Generate values for any missing or empty fields:
   - brand (if missing, try to infer it from the name, e.g. "OPPO Reno 14 5G" -> brand "OPPO")
   - category (if missing, determine from: 'Electronics', 'Fashion', 'Beauty', 'Furniture', 'Sports', 'Gaming', 'Books', 'Home & Kitchen', 'Accessories', 'Groceries', or suggest a new relevant category)
   - subCategory (if missing, suggest a specific subcategory name)
   - audience (if missing, suggest 'Unisex', 'Men', 'Women', 'Kids')
   - collections (if missing, suggest matching collections from: 'Trending Now', 'Best Sellers', 'New Arrivals', 'Gaming Setup', 'Student Essentials', 'Festival Offers', 'Luxury Picks', 'Work From Home', 'Photography Essentials', 'Sports Essentials', or suggest a new relevant collection if highly specific)
   - tags (if missing, generate search tags)
   - keywords (if missing, generate search keywords)
   - description (if missing, write a detailed and appealing product description)
   - specifications (if missing or empty, generate a list of likely specifications for this product)

You MUST respond strictly in the following JSON format:
{
  "name": "Product Name",
  "brand": "Brand",
  "price": 32999,
  "stock": 50,
  "description": "Product description",
  "category": "Category Name",
  "subCategory": "Subcategory Name",
  "audience": "Unisex | Men | Women | Kids",
  "collections": ["Collection 1", "Collection 2"],
  "tags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"],
  "specifications": [{"key": "Key", "value": "Value"}]
}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(productData, null, 2) }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini enrich error:", data);
      throw new Error(data?.error?.message || "Gemini enrichment API error");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini enrichment engine");
    }

    const cleanedText = cleanJson(rawText);
    const result = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Enrichment error:", error.message);
    res.status(500).json({ success: false, message: "AI enrichment failed: " + error.message });
  }
};

export const improveField = async (req, res) => {
  try {
    const { field, productData } = req.body;
    if (!field || !productData) {
      return res.status(400).json({ success: false, message: "Field and productData are required." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Mock / fallback response
      if (field === "description") {
        return res.json({ success: true, description: `${productData.description || ""} (AI Improved Description)` });
      } else if (field === "seo") {
        return res.json({ success: true, seoDescription: `Buy ${productData.name || "Product"} online at best price.`, keywords: ["shop", "buy"] });
      } else if (field === "tags") {
        return res.json({ success: true, tags: ["trending", "new"] });
      } else if (field === "collections") {
        return res.json({ success: true, collections: ["New Arrivals"] });
      } else if (field === "specifications") {
        return res.json({ success: true, specifications: [...(productData.specifications || []), { key: "Warranty", value: "1 Year" }] });
      }
      return res.status(400).json({ success: false, message: "Unknown field improvement requested." });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    let systemPrompt = "";

    if (field === "description") {
      systemPrompt = `You are a professional copywriter. Improve the product description to make it professional, engaging, and search-optimized.
Respond strictly in JSON format:
{
  "description": "Improved description text here"
}`;
    } else if (field === "seo") {
      systemPrompt = `You are an SEO expert. Generate an optimized SEO Meta Description (max 160 characters) and a list of search keywords (list of lowercase strings without spaces) for this product.
Respond strictly in JSON format:
{
  "seoDescription": "SEO meta description here",
  "keywords": ["keyword1", "keyword2"]
}`;
    } else if (field === "tags") {
      systemPrompt = `Generate a list of search tags (list of lowercase strings) for this product.
Respond strictly in JSON format:
{
  "tags": ["tag1", "tag2"]
}`;
    } else if (field === "collections") {
      systemPrompt = `Determine the best collections for this product from the available collections: 'Trending Now', 'Best Sellers', 'New Arrivals', 'Gaming Setup', 'Student Essentials', 'Festival Offers', 'Luxury Picks', 'Work From Home', 'Photography Essentials', 'Sports Essentials'. Or suggest a new relevant collection if it is highly specific.
Respond strictly in JSON format:
{
  "collections": ["Collection 1", "Collection 2"]
}`;
    } else if (field === "specifications") {
      systemPrompt = `You are an expert product detailer. Complete the missing specifications for this product. Return all relevant specifications as key-value pairs (preserving or expanding current ones).
Respond strictly in JSON format:
{
  "specifications": [{"key": "KeyName", "value": "Value"}]
}`;
    } else {
      return res.status(400).json({ success: false, message: "Unknown field improvement requested." });
    }

    const prompt = `Product details:\n${JSON.stringify(productData, null, 2)}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini field improvement error:", data);
      throw new Error(data?.error?.message || "Gemini improvement API error");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini field improver");
    }

    const cleanedText = cleanJson(rawText);
    const result = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Field improvement error:", error.message);
    res.status(500).json({ success: false, message: "AI field improvement failed: " + error.message });
  }
};

export const generateProductImage = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required for image generation." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server .env");
    }

    const prompt = `Professional studio product photography of a ${name}. ${description || ""}. Clean background, high-end commercial packaging, soft cinematic lighting, 8k resolution, photorealistic.`;
    
    console.log("Starting Gemini Imagen 4.0 Image Generation with prompt:", prompt);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiApiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        instances: [
          {
            prompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/png"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini API returned status ${response.status}`);
    }

    const prediction = data?.predictions?.[0];
    if (!prediction || !prediction.bytesBase64Encoded) {
      throw new Error("No image prediction bytes returned from Gemini");
    }

    console.log("Gemini generation successful. Uploading base64 image to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(`data:image/png;base64,${prediction.bytesBase64Encoded}`, {
      folder: "products",
      resource_type: "image"
    });

    console.log("Cloudinary upload successful:", uploadResult.secure_url);
    res.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      demo: false,
      message: "AI product image generated successfully."
    });
  } catch (error) {
    console.error("Gemini AI image generation failed. Falling back to mock/demo image. Error:", error.message);
    
    // Pick a mock image as fallback
    const mockImages = [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", // Nike Shoes
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", // Watch
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", // Headphones
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800", // Sunglasses
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800"  // Boot/shoes
    ];
    let index = 0;
    const name = req.body.name || "";
    if (name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      index = Math.abs(hash) % mockImages.length;
    }
    const mockImageUrl = mockImages[index];

    // Upload fallback to Cloudinary
    let cloudinaryUrl = mockImageUrl;
    try {
      console.log("Uploading fallback image to Cloudinary...");
      const uploadResult = await cloudinary.uploader.upload(mockImageUrl, {
        folder: "products",
        resource_type: "image"
      });
      cloudinaryUrl = uploadResult.secure_url;
      console.log("Cloudinary fallback upload successful:", cloudinaryUrl);
    } catch (uploadErr) {
      console.error("Cloudinary upload of fallback image failed:", uploadErr.message);
    }

    res.json({
      success: true,
      imageUrl: cloudinaryUrl,
      demo: true,
      message: `Gemini failed (${error.message}). Fell back to demo mode.`
    });
  }
};


