import productModel from "../models/productModel.js";



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
