

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "1mb" }));

// Check required environment variables
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from backend/.env");
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_PROJECT_ID is missing from backend/.env");
}

// Initialize Firebase Admin
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "firebase-service-account.json");

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.resolve(__dirname, credentialsPath),
    "utf8"
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Verify Firebase login
async function requireFirebaseUser(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        error: "Please sign in first.",
      });
    }

    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Your login session could not be verified.",
    });
  }
}

// Create scenario-specific demo replies
function getDemoReply(scenario, agent, userMessage, history) {
  const scenarioText = String(scenario || "").toLowerCase();
  const agentText = String(agent || "").toLowerCase();
  const messageText = String(userMessage || "").toLowerCase();
  const turn = Array.isArray(history) ? history.length : 0;

  let replies;

  if (
    scenarioText.includes("job") ||
    scenarioText.includes("salary") ||
    scenarioText.includes("employment")
  ) {
    replies = [
      "Thank you for sharing your offer. Could we discuss a salary that better reflects the responsibilities and expectations of this role?",
      "I appreciate your proposal. Could we explore a compromise involving the base salary, benefits, or joining date?",
      "I understand your position. If we can agree on compensation and work flexibility, I believe we can move closer to an agreement.",
      "Thank you for the discussion. Let's review the salary, benefits, and other terms to find an arrangement that works for both sides.",
    ];
  } else if (
    scenarioText.includes("vendor") ||
    scenarioText.includes("supplier") ||
    scenarioText.includes("procurement")
  ) {
    replies = [
      "Thank you for the quotation. Could you offer a lower unit price for this order quantity?",
      "We appreciate your offer. Could we discuss a volume discount, delivery schedule, and payment terms?",
      "If we can agree on a competitive price and reliable delivery, we would be interested in moving forward.",
      "Let's find a practical agreement on price, quantity, quality, and delivery that works for both parties.",
    ];
  } else if (
    scenarioText.includes("budget") ||
    scenarioText.includes("project")
  ) {
    replies = [
      "Our budget is limited. Could we prioritize the essential features for the first phase?",
      "Thank you for the proposal. Could we adjust the project scope to fit the available budget?",
      "Would a phased delivery plan help us balance cost, quality, and deadlines?",
      "Let's agree on the key deliverables, budget, and timeline before proceeding.",
    ];
  } else if (
    scenarioText.includes("partner") ||
    scenarioText.includes("partnership") ||
    scenarioText.includes("business")
  ) {
    replies = [
      "Let's clarify each partner's responsibilities and expected contributions before finalizing the proposal.",
      "Could we discuss investment amounts, ownership shares, and how decisions will be made?",
      "I suggest we define how profits, risks, and responsibilities will be shared.",
      "Let's document the proposed terms clearly so both partners understand their commitments.",
    ];
  } else if (
    scenarioText.includes("conflict") ||
    scenarioText.includes("dispute") ||
    scenarioText.includes("resolution")
  ) {
    replies = [
      "I understand that we have different perspectives. Could you explain the main concern you would like us to address first?",
      "Let's focus on the issue rather than assigning blame and identify a solution that respects both sides.",
      "I hear your concern. Could we consider a compromise that addresses the most important needs of both parties?",
      "Let's agree on practical next steps and responsibilities so we can move forward constructively.",
    ];
  } else {
    replies = [
      "Thank you for sharing your perspective. Could you explain which outcome matters most to you?",
      "I understand your proposal. Let's explore a compromise that respects the priorities of both parties.",
      "Could we identify the main points of disagreement and work through them one by one?",
      "Let's agree on a practical next step that both parties consider fair.",
    ];
  }

  // Slightly vary the fallback based on the agent's role.
  // These remain predefined demo responses, not live AI output.
  if (
    agentText.includes("risk") ||
    agentText.includes("conservative") ||
    agentText.includes("strict")
  ) {
    return replies[(turn + 1) % replies.length];
  }

  if (
    agentText.includes("collaborative") ||
    agentText.includes("cooperative")
  ) {
    return replies[(turn + 2) % replies.length];
  }

  // Keep responses predictable enough for a presentation.
  return replies[turn % replies.length];
}

// Generate an AI negotiation response
app.post("/api/negotiate", requireFirebaseUser, async (req, res) => {
  try {
    const {
      scenario,
      agent,
      settings = {},
      history = [],
      userMessage,
    } = req.body;

    // Validate request
    if (
      typeof scenario !== "string" ||
      typeof agent !== "string" ||
      typeof userMessage !== "string" ||
      !userMessage.trim() ||
      userMessage.length > 3000 ||
      !Array.isArray(history) ||
      history.length > 20 ||
      history.some(
        (item) =>
          !item ||
          !["user", "model"].includes(item.role) ||
          typeof item.text !== "string" ||
          item.text.length > 3000
      ) ||
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      return res.status(400).json({
        error: "Invalid negotiation request.",
      });
    }

    // Read saved preferences, using defaults when unavailable
    const responseStyle = [
      "Balanced",
      "Collaborative",
      "Assertive",
    ].includes(settings.responseStyle)
      ? settings.responseStyle
      : "Balanced";

    const responseLength = [
      "Short",
      "Medium",
      "Long",
    ].includes(settings.responseLength)
      ? settings.responseLength
      : "Medium";

    const defaultAgent = settings.defaultAgent || "";

    // Build the conversation history
    const contents = [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Negotiation scenario: ${scenario}

Your agent role/personality: ${agent}

User's latest message: ${userMessage}`,
          },
        ],
      },
    ];

    // Instructions based on the user's Settings preferences
    const systemInstruction = `
You are an AI negotiation participant in a training simulator.

SCENARIO:
${scenario}

AGENT:
${agent}

DEFAULT AI AGENT PREFERENCE:
${defaultAgent || "Use the agent selected in the negotiation workspace."}

NEGOTIATION RESPONSE STYLE:
${responseStyle}

Follow the selected style:
- Balanced: Be fair, professional, practical, and open to compromise.
- Collaborative: Explore shared interests and suggest win-win solutions.
- Assertive: State your position, limits, and counteroffers clearly while remaining respectful.

RESPONSE LENGTH:
${responseLength}

Follow the selected length:
- Short: Respond in approximately 2–4 sentences.
- Medium: Respond in approximately 1–3 short paragraphs.
- Long: Provide a detailed response with reasoning, options, and trade-offs.

NEGOTIATION RULES:
- Respond directly to the user's latest message.
- Make realistic offers or counteroffers when appropriate.
- Consider the previous conversation and remain consistent.
- Keep the discussion focused on reaching a fair agreement.
- Do not assume the budget, deadline, or other constraints can be changed unless discussed.
- Never claim that an agreement is final unless both parties agree.
- Never claim to have performed real-world actions.
- Use clear, professional language.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = result.text;

    if (!reply || !reply.trim()) {
      return res.status(502).json({
        error: "The AI returned an empty response.",
      });
    }

    return res.json({
      reply,
      demoMode: false,
    });
  } catch (error) {
    console.error(
      "Negotiation request failed:",
      error.message
    );

    // Use a scenario-specific fallback if live Gemini fails.
    const { scenario, agent, userMessage, history } = req.body;

    const reply = getDemoReply(
      scenario,
      agent,
      userMessage,
      history
    );

    return res.json({
      reply,
      demoMode: true,
      notice:
        "Demo response — live AI is temporarily unavailable. This reply is predefined.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Negotiation backend running at http://localhost:${PORT}`
  );
});




