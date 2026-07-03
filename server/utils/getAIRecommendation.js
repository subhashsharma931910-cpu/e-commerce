export async function getAIRecommendation(userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

  if (!API_KEY) {
    throw new Error("AI API key is not configured.");
  }

  const candidates = products.slice(0, 50).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description?.slice(0, 120) || "",
  }));

  try {
    const geminiPrompt = `
        Here is a list of available products:
        ${JSON.stringify(candidates, null, 2)}

        Based on the following user request, return only a JSON array of product ids that best match the request.
        Do not include any additional text or markdown outside of the JSON array.
        User request: "${userPrompt}"
    `;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const cleanedText = aiResponseText.replace(/```json|```/g, ``).trim();

    if (!cleanedText) {
      throw new Error("AI response is empty or invalid.");
    }

    let parsedIds;
    try {
      parsedIds = JSON.parse(cleanedText);
    } catch (error) {
      throw new Error("Failed to parse AI response.");
    }

    if (!Array.isArray(parsedIds)) {
      throw new Error("AI response did not return a JSON array.");
    }

    const productIds = parsedIds
      .map((item) => (typeof item === "string" ? item : item?.id))
      .filter(Boolean);

    const matchedProducts = products.filter((product) =>
      productIds.includes(product.id?.toString()),
    );

    return {
      success: true,
      products: matchedProducts.length > 0 ? matchedProducts : products,
      fallback: matchedProducts.length === 0,
    };
  } catch (error) {
    throw new Error(error.message || "Internal server error.");
  }
}
