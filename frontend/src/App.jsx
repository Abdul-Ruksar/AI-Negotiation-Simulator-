
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

const scenarios = [
  {
    id: "vendor",
    number: "01",
    icon: "🤝",
    title: "Vendor Pricing Negotiation",
    description:
      "Negotiate product pricing, delivery terms and contract duration.",
    color: "blue",
    image: "/images/vendor-negotiation.png",
    agents: [
      {
        id: "buyer",
        name: "Buyer",
        role: "Procurement Manager",
        description: "Purchases products and negotiates favorable terms.",
        goal: "Get the best price while maintaining product quality.",
        constraints: [
          "Budget limit: $50,000",
          "Minimum quality standards",
          "Delivery within 30 days",
        ],
        personality: "Collaborative",
      },
      {
        id: "vendor",
        name: "Vendor",
        role: "Supplier",
        description: "Supplies products while maintaining profitable contracts.",
        goal: "Maximize profit and maintain a long-term relationship.",
        constraints: [
          "Minimum acceptable price: $30,000",
          "Production capacity",
          "Delivery timeline",
        ],
        personality: "Aggressive",
      },
    ],
  },
  {
    id: "job",
    number: "02",
    icon: "💼",
    title: "Job Offer Negotiation",
    description:
      "Discuss salary, benefits, work arrangements and joining terms.",
    color: "purple",
    image: "/images/job-offer.png",
    agents: [
      {
        id: "candidate",
        name: "Candidate",
        role: "Job Seeker",
        description:
          "Negotiates an employment package that supports career goals.",
        goal: "Maximize salary, benefits and work flexibility.",
        constraints: [
          "Minimum acceptable salary",
          "Preferred work model",
          "Joining date",
        ],
        personality: "Collaborative",
      },
      {
        id: "recruiter",
        name: "Recruiter",
        role: "Hiring Manager",
        description:
          "Hires suitable candidates within company requirements.",
        goal: "Hire the right candidate within the approved budget.",
        constraints: [
          "Salary budget",
          "Company policies",
          "Hiring timeline",
        ],
        personality: "Risk-Averse",
      },
    ],
  },
  {
    id: "budget",
    number: "03",
    icon: "👥",
    title: "Project Budget Allocation",
    description:
      "Allocate limited project funds across competing department needs.",
    color: "green",
    image: "/images/budget-allocation.png",
    agents: [
      {
        id: "manager",
        name: "Project Manager",
        role: "Budget Coordinator",
        description: "Coordinates teams and keeps spending within budget.",
        goal: "Deliver project objectives within the total budget.",
        constraints: [
          "Total budget limit",
          "Project deadlines",
          "Priority requirements",
        ],
        personality: "Collaborative",
      },
      {
        id: "department",
        name: "Department Representative",
        role: "Department Head",
        description:
          "Represents department needs during budget allocation.",
        goal: "Secure sufficient resources for key department priorities.",
        constraints: [
          "Minimum operational resources",
          "Department deadlines",
          "Fair allocation",
        ],
        personality: "Risk-Averse",
      },
    ],
  },
];

const navigation = [
  { label: "Home", icon: "⌂" },
  { label: "Select Scenario", icon: "▦" },
  { label: "Configure Agents", icon: "⚙" },
  { label: "Review & Start", icon: "✓" },
  { label: "Start Negotiation", icon: "▷" },
  { label: "Reports", icon: "▤" },
  { label: "Settings", icon: "⚙" },
];

const personalities = ["Aggressive", "Collaborative", "Risk-Averse"];

function App() {
  const [activeNav, setActiveNav] = useState("Select Scenario");
  const [executionMode, setExecutionMode] = useState("human");
  const [selectedId, setSelectedId] = useState(null);
  const [settings, setSettings] = useState(() => {
    const initial = {};

    scenarios.forEach((scenario) => {
      scenario.agents.forEach((agent) => {
        initial[agent.id] = agent.personality;
      });
    });

    return initial;
  });
  const [started, setStarted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const scenario = scenarios.find((item) => item.id === selectedId);

  function chooseScenario(id) {
    setSelectedId(id);
    setStarted(false);
  }

  function updatePersonality(agentId, value) {
    setSettings((previous) => ({
      ...previous,
      [agentId]: value,
    }));
  }

  function navigate(page) {
    setActiveNav(page);
  }

  function startNegotiation() {
  setStarted(true);
  setActiveNav("Start Negotiation");

  if (executionMode === "ai") {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("start-ai-simulation")
      );
    }, 100);
  }
}

  async function handleSignOut() {
    try {
      await signOut(auth);
      setAuthView("login");
    } catch (error) {
      console.error("Unable to sign out:", error);
      window.alert("Unable to sign out. Please try again.");
    }
  }
  if (authLoading) {
    return <p>Checking your login...</p>;
  }

  if (!currentUser) {
    if (authView === "register") {
      return <Register onShowLogin={() => setAuthView("login")} />;
    }

    return <Login onShowRegister={() => setAuthView("register")} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("Home")}>
          <span className="brand-icon">✧</span>
          <span className="brand-copy">
            <strong>Multi-Agent</strong>
            <small>Negotiation Simulator</small>
          </span>
        </button>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activeNav === item.label ? "active" : ""
              }`}
              onClick={() => navigate(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeNav === item.label && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon">✦</div>
          <strong>Better Negotiation</strong>
          <p>
            Bring different perspectives together to discover better
            decisions.
          </p>
          <span>AI WORKSPACE · V1.0</span>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">R</div>
          <div>
            <strong>Ruksar</strong>
            <small>Workspace member</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <div className="status-pill">
              <span />
              Workspace ready
            </div>

            <button
              className="notification-button"
              aria-label="Notifications"
            >
              ♧<i />
            </button>

            <div className="profile">
              <div className="avatar">R</div>
              <div className="profile-info">
                <strong>Welcome, Ruksar!</strong>
                <small>{currentUser?.email || "Project workspace"}</small>
              </div>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="content">
          
{activeNav === "Select Mode" && (
  <div className="placeholder-page">
    <div className="large-page-icon">🤝</div>
    <h1>Choose Negotiation Mode</h1>
    <p>Select how you want to negotiate.</p>

    <div className="feature-content">
      <div className="feature-card">
        <h3>AI vs AI Simulation</h3>
        <p>Watch two AI agents negotiate automatically.</p>
        <button
          className="continue-button"
          onClick={() => {
            setExecutionMode("ai");
            navigate("Select Scenario");
          }}
        >
          AI vs AI
        </button>
      </div>

      <div className="feature-card">
        <h3>Human vs AI Practice</h3>
        <p>Negotiate directly with an AI agent.</p>
        <button
          className="continue-button"
          onClick={() => {
            setExecutionMode("human");
            navigate("Select Scenario");
          }}
        >
          Human vs AI
        </button>
      </div>
    </div>
  </div>
)}

          {["Home", "Select Scenario"].includes(activeNav) && (
            <ScenarioPage
            scenarios={scenarios}
            selectedId={selectedId}
            onChoose={chooseScenario}
            onConfigure={() => navigate("Configure Agents")}
            setExecutionMode={setExecutionMode}
            navigate={navigate}
          />
          )}

          {activeNav === "Configure Agents" && (
            <AgentPage
              scenario={scenario}
              settings={settings}
              onPersonalityChange={updatePersonality}
              onBack={() => navigate("Select Scenario")}
              onContinue={() => navigate("Review & Start")}
            />
          )}

          {activeNav === "Review & Start" && (
            <ReviewPage
              scenario={scenario}
              settings={settings}
              onBack={() => navigate("Configure Agents")}
              onStart={startNegotiation}
            />
          )}

          {activeNav === "Start Negotiation" && (
            <NegotiationPage
              scenario={scenario}
              settings={settings}
              started={started}
              onBack={() => navigate("Review & Start")}
              onRestart={() => {
                setStarted(false);
                navigate("Select Scenario");
              }}
              executionMode={executionMode}
            />
          )}

          {["Reports", "Settings"].includes(activeNav) && (
            <ComingSoonPage
              title={activeNav}
              onBack={() => navigate("Select Scenario")}
            />
          )}

          <footer className="page-footer">
            <span>Multi-Agent Negotiation Simulator</span>
            <span>Intelligent collaboration. Better decisions.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="page-intro">
      <div className="eyebrow">
        <span className="eyebrow-dot" />
        {eyebrow}
      </div>
      <h1>{title}</h1>
      <p className="subtitle">{description}</p>
    </div>
  );
}

function ProgressSteps({ active = 1 }) {
  const steps = [
    ["01", "Select scenario", "Choose your challenge"],
    ["02", "Configure agents", "Set goals and personalities"],
    ["03", "Review & start", "Prepare negotiation"],
  ];

  return (
    <div className="steps">
      {steps.map((step, index) => (
        <div className="progress-part" key={step[0]}>
          <div
            className={`step ${
              active >= index + 1 ? "step-reached" : ""
            } ${active === index + 1 ? "active-step" : ""}`}
          >
            <span>{step[0]}</span>
            <div>
              <strong>{step[1]}</strong>
              <small>{step[2]}</small>
            </div>
          </div>

          {index < steps.length - 1 && (
            <div className="step-line" />
          )}
        </div>
      ))}
    </div>
  );
}

function ScenarioPage({
  scenarios,
  selectedId,
  onChoose,
  onConfigure,
  setExecutionMode,
  navigate,
}) {
  const current = scenarios.find((item) => item.id === selectedId);

  return (
    <>
      <div className="welcome-row">
        <PageIntro
          eyebrow="YOUR NEGOTIATION WORKSPACE"
          title="Make every negotiation count."
          description="Choose a scenario, configure your AI agents, and discover better outcomes together."
        />

        <div className="session-card">
          <div className="session-icon">✧</div>
          <div>
            <span>YOUR WORKSPACE</span>
            <strong>Negotiation Studio</strong>
            <small>Ready to get started</small>
          </div>
        </div>
      </div>

      <section className="ai-hero">
        <div className="ai-hero-content">
          <span className="ai-hero-badge">
            <span className="hero-pulse" />
            INTELLIGENCE MEETS COLLABORATION
          </span>

          <h2>
            Better negotiations.
            <br />
            <span>Smarter decisions.</span>
          </h2>

          <p>
            Bring AI agents together, explore different perspectives,
            and discover smarter outcomes through intelligent
            negotiation.
          </p>

          <div className="ai-hero-features">
            <span>✦ AI-powered agents</span>
            <span>↗ Goal-driven decisions</span>
          </div>

          
          <button
            className="hero-cta"
            onClick={() => {
              if (selectedId) {
                onConfigure();
              }
            }}
            disabled={!selectedId}
            title={
              selectedId
                ? "Configure your agents"
                : "Please select a scenario first"
            }
          >
            Configure your agents <span>→</span>
          </button>

          {!selectedId && (
            <p className="selection-hint">
              Please select a negotiation scenario below to continue.
            </p>
          )}

        </div>
        <div className="ai-hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="hero-art-label">
            <span className="hero-art-dot" />
            Your AI team is ready
          </div>

          <img
            src="/images/hero-ai.png"
            alt="Professional collaborating with an AI robot"
          />

          <div className="hero-floating-card">
            <span className="floating-check">✓</span>
            <div>
              <strong>Smart collaboration</strong>
              <small>Better outcomes, together</small>
            </div>
          </div>
        </div>
      </section>
      
<div className="feature-content" style={{ marginTop: 30 }}>
  <h2>Choose Your Negotiation Mode</h2>
  <p>Select how you want the negotiation to happen.</p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 20,
      marginTop: 20,
    }}
  >
    <div className="feature-card">
      <h3>🤖 AI vs AI Simulation</h3>
      <p>Watch two AI agents negotiate automatically.</p>
      
      <button
        className="continue-button"
        onClick={() => {
        setExecutionMode("ai");
        if (selectedId) {
          onConfigure();
        } else {
          alert("Please select a negotiation scenario first.");
        }
      }}
      >
        Start AI vs AI
      </button>
    </div>

    <div className="feature-card">
      <h3>🤝 Human vs AI Practice</h3>
      <p>Negotiate directly with an AI agent.</p>
      <button
        className="continue-button"
        onClick={() => {
        setExecutionMode("human");
        if (selectedId) {
          onConfigure();
        } else {
          alert("Please select a negotiation scenario first.");
        }
      }}
      >
        Start Practice
      </button>
    </div>
  </div>
</div>


      <ProgressSteps active={1} />

      <div className="section-heading">
        <div>
          <h2>Choose your scenario</h2>
          <p>
            Every challenge has its own goals, constraints, and
            opportunities.
          </p>
        </div>
        <span className="scenario-count">03 SCENARIOS</span>
      </div>

      <div className="scenario-grid">
        {scenarios.map((item) => (
          <article
            key={item.id}
            className={`scenario-card ${item.color} ${
              selectedId === item.id ? "selected-card" : ""
            }`}
          >
            <div className="scenario-image">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
              />

              <span className="scenario-image-icon">
                {item.icon}
              </span>

              {selectedId === item.id && (
                <span className="selected-badge">✓ Selected</span>
              )}
            </div>

            <div className="scenario-card-body">
              <span className="scenario-number">
                SCENARIO {item.number}
              </span>

              <h3>{item.title}</h3>
              <p className="scenario-description">
                {item.description}
              </p>

              <div className="card-divider" />

              <div className="detail-label">
                PARTICIPATING AGENTS
              </div>

              <div className="agent-list">
                {item.agents.map((agent, index) => (
                  <div className="agent-row" key={agent.id}>
                    <span className={`agent-dot agent-${index}`}>
                      {agent.name.charAt(0)}
                    </span>
                    <span>
                      {agent.name}
                      <small> · {agent.role}</small>
                    </span>
                  </div>
                ))}
              </div>

              <div className="goal-panel">
                <div className="detail-label">KEY OBJECTIVES</div>
                {item.agents.map((agent) => (
                  <div className="goal-row" key={agent.id}>
                    <span>✓</span>
                    {agent.goal}
                  </div>
                ))}
              </div>

              <button
                className="select-button"
                onClick={() => onChoose(item.id)}
              >
                {selectedId === item.id
                  ? "Selected scenario"
                  : "Select scenario"}
                <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      
      <section className="selection-summary">
        <div className="summary-icon">
          {selectedId ? "✓" : "!"}
        </div>

        <div className="summary-text">
          <strong>
            {selectedId
              ? current.title
              : "No scenario selected"}
          </strong>
          <p>
            {selectedId
              ? "Your scenario is selected. Configure the participating agents to continue."
              : "Please select one of the three scenarios above before configuring agents."}
          </p>
        </div>

        <button
          className="continue-button"
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) {
              onConfigure();
            }
          }}
        >
          Configure agents <span>→</span>
        </button>
      </section>


      <div className="feature-strip">
        <div>
          <span>✧</span>
          <strong>AI-powered agents</strong>
          <small>Intelligent negotiation</small>
        </div>
        <div>
          <span>◈</span>
          <strong>Custom personalities</strong>
          <small>Flexible strategies</small>
        </div>
        <div>
          <span>◎</span>
          <strong>Real-world scenarios</strong>
          <small>Practical challenges</small>
        </div>
        <div>
          <span>↗</span>
          <strong>Better decisions</strong>
          <small>Outcome-focused</small>
        </div>
      </div>
    </>
  );
}

function AgentPage({
  scenario,
  settings,
  onPersonalityChange,
  onBack,
  onContinue,
}) {
  return (
    <>
      <PageIntro
        eyebrow="STEP 02 · AGENT PERSONALIZATION"
        title="Configure your agents."
        description="Review each agent's role, objectives and constraints. Choose a personality for each participant."
      />

      <div className="agent-page-heading">
        <span className={`scenario-tag ${scenario.color}`}>
          {scenario.icon} {scenario.title}
        </span>
        <span className="scenario-count">
          {scenario.agents.length} AGENTS
        </span>
      </div>

      <ProgressSteps active={2} />

      <div className="section-heading">
        <div>
          <h2>Meet your negotiation team</h2>
          <p>
            Each agent has an independent goal and negotiation style.
          </p>
        </div>
      </div>

      <div className="configured-agent-grid">
        {scenario.agents.map((agent, index) => (
          <article className="configured-agent-card" key={agent.id}>
            <div className="configured-agent-top">
              <div className={`configured-agent-avatar avatar-${index}`}>
                {agent.name.charAt(0)}
              </div>

              <div className="configured-agent-identity">
                <h3>{agent.name}</h3>
                <span>{agent.role}</span>
              </div>

              <span className="agent-status">Active</span>
            </div>

            <p className="agent-description">{agent.description}</p>

            <div className="agent-information">
              <span className="detail-label">PRIMARY GOAL</span>
              <p>{agent.goal}</p>
            </div>

            <div className="agent-information">
              <span className="detail-label">KEY CONSTRAINTS</span>
              <ul>
                {agent.constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            </div>

            <div className="personality-section">
              <label htmlFor={`personality-${agent.id}`}>
                Negotiation personality
              </label>

              <select
                id={`personality-${agent.id}`}
                value={settings[agent.id]}
                onChange={(event) =>
                  onPersonalityChange(agent.id, event.target.value)
                }
              >
                {personalities.map((personality) => (
                  <option key={personality} value={personality}>
                    {personality}
                  </option>
                ))}
              </select>

              <p className="personality-help">
                {settings[agent.id] === "Aggressive" &&
                  "Assertive and firm, with a strong focus on achieving objectives."}
                {settings[agent.id] === "Collaborative" &&
                  "Seeks mutually beneficial solutions and shared value."}
                {settings[agent.id] === "Risk-Averse" &&
                  "Prioritizes predictable outcomes and minimizes risk."}
              </p>
            </div>
          </article>
        ))}
      </div>

      <section className="selection-summary">
        <div className="summary-icon">✓</div>
        <div className="summary-text">
          <strong>Agent configuration ready to review</strong>
          <p>Your choices are saved in the current browser session.</p>
        </div>
        <div className="agent-actions">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <button className="continue-button" onClick={onContinue}>
            Review configuration →
          </button>
        </div>
      </section>
    </>
  );
}

function ReviewPage({ scenario, settings, onBack, onStart }) {
  return (
    <>
      <PageIntro
        eyebrow="STEP 03 · FINAL CHECK"
        title="Review your configuration."
        description="Confirm the scenario, agent objectives, constraints and personalities before continuing."
      />

      <ProgressSteps active={3} />

      <section className="review-scenario-card">
        <span className={`scenario-tag ${scenario.color}`}>
          {scenario.icon} {scenario.title}
        </span>

        <h2>Negotiation participants</h2>

        {scenario.agents.map((agent, index) => (
          <div className="review-agent-row" key={agent.id}>
            <div className={`configured-agent-avatar avatar-${index}`}>
              {agent.name.charAt(0)}
            </div>

            <div className="summary-text">
              <strong>
                {agent.name} — {agent.role}
              </strong>
              <p>{agent.goal}</p>
              <small>
                Constraints: {agent.constraints.join(" · ")}
              </small>
            </div>

            <span className="personality-pill">
              {settings[agent.id]}
            </span>
          </div>
        ))}
      </section>

      <section className="selection-summary">
        <div className="summary-icon">✓</div>
        <div className="summary-text">
          <strong>Configuration review complete</strong>
          <p>Check your settings before preparing the negotiation.</p>
        </div>
        <div className="agent-actions">
          <button className="back-button" onClick={onBack}>
            ← Edit agents
          </button>
          <button className="continue-button" onClick={onStart}>
            Prepare negotiation →
          </button>
        </div>
      </section>
    </>
  );
}


function NegotiationPage({ scenario, settings, started, onBack, onRestart, executionMode }) {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const agents = scenario?.agents || [];
  const isAiVsAi = executionMode === "ai";
  const selectedAgent = agents.find(
  (agent) => agent.id === selectedAgentId
  );
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [sessionId] = useState(() => `neg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Save the whole conversation as one report session, not one report per exchange.
  useEffect(() => {
    if (!scenario || messages.length === 0) return;

    try {
      const saved = JSON.parse(localStorage.getItem("negotiationReports") || "[]");
      const existingIndex = saved.findIndex((report) => report.id === sessionId);
      const session = {
        id: sessionId,
        date: existingIndex >= 0 ? saved[existingIndex].date : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mode: isAiVsAi ? "AI vs AI" : "Human vs AI",
        scenario: scenario.title,
        scenarioId: scenario.id,
        agents: agents.map((agent) => ({
          name: agent.name,
          role: agent.role,
          personality: settings?.[agent.id] || agent.personality || "Collaborative",
        })),
        messages: messages.map((message) => ({
          role: message.role,
          agentName: message.agentName || (message.role === "user" ? "You" : selectedAgent?.name || "AI Agent"),
          text: message.text,
          timestamp: message.timestamp || new Date().toISOString(),
        })),
      };

      if (existingIndex >= 0) saved[existingIndex] = session;
      else saved.unshift(session);
      localStorage.setItem("negotiationReports", JSON.stringify(saved.slice(0, 100)));
    } catch (storageError) {
      console.error("Could not save negotiation session:", storageError);
    }
  }, [messages, scenario, settings, agents, isAiVsAi, sessionId, selectedAgent]);
 

  useEffect(() => {
    setSelectedAgentId(
      scenario?.agents?.[1]?.id || scenario?.agents?.[0]?.id || ""
    );
    setMessages([]);
    setDraft("");
    setError("");
  }, [scenario]);

  async function runAiSimulation() {
  if (simulationRunning || loading) return;

  if (!started) {
    setError("Please prepare the negotiation first.");
    return;
  }

  if (agents.length < 2) {
    setError("This scenario needs two AI agents.");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    setError("Please sign in again to continue.");
    return;
  }

  setError("");
  setSimulationRunning(true);
  setLoading(true);
  setMessages([]);

  try {
    const token = await user.getIdToken();
    let history = [];

    for (let turn = 0; turn < 6; turn++) {
      const agent = agents[turn % 2];

      const response = await fetch(
        "https://ai-negotiation-backend.onrender.com/api/negotiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scenario: scenario.title,
            agent: `${agent.name} (${agent.role})`,
            settings,
            history,
            userMessage:
              turn === 0
                ? `Start the negotiation. You are ${agent.name}, acting as ${agent.role}. Make your opening proposal.`
                : `It is your turn, ${agent.name}. Respond to the other agent's latest proposal and continue the negotiation. Stay in character as ${agent.role}.`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The AI request failed.");
      }

      const reply = data.reply;

      history = [
        ...history,
        { role: "user", text: `Turn ${turn + 1}: ${agent.name}'s turn.` },
        { role: "model", text: reply },
      ];

      setMessages((previous) => [
        ...previous,
        { role: "model", text: reply, agentName: agent.name, timestamp: new Date().toISOString() },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  } catch (err) {
    console.error("AI vs AI simulation error:", err);
    setError(err.message || "The AI simulation failed.");
  } finally {
    setLoading(false);
    setSimulationRunning(false);
  }
}
  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();

    if (!text || loading) return;

    if (!started) {
      setError("Please open Review & Start and click Prepare negotiation first.");
      return;
    }

    if (!selectedAgent) {
      setError("Please select an AI agent.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please sign in again to continue.");
      return;
    }

    setError("");
    setDraft("");
    setMessages((old) => [...old, { role: "user", text, agentName: "You", timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const token = await user.getIdToken();

      const agentDetails = [
        `Name: ${selectedAgent.name}`,
        `Role: ${selectedAgent.role}`,
        `Goal: ${selectedAgent.goal}`,
        `Personality: ${
          settings?.[selectedAgent.id] ||
          selectedAgent.personality ||
          "Collaborative"
        }`,
        `Constraints: ${(selectedAgent.constraints || []).join(", ")}`,
        `Description: ${selectedAgent.description || ""}`,
      ].join("\n");

      const response = await fetch("https://ai-negotiation-backend.onrender.com/api/negotiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenario: scenario.title,
          agent: selectedAgent.name,
          settings: settings,
          history: messages.slice(-20).map((message) => ({
            role: message.role,
            text: message.text,
          })),
          userMessage: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The AI request failed.");
      }
      
      setMessages((old) => [
        ...old,
        { role: "model", text: data.reply, agentName: selectedAgent.name, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error("Negotiation error:", err);
      setError(
        err.message ||
          "Could not connect to the backend. Check that it is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="placeholder-page" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="large-page-icon">🤝</div>
      <span className="eyebrow">AI NEGOTIATION WORKSPACE</span>
      <h1>{scenario.title}</h1>
      <p>Send an offer and negotiate with your selected AI agent.</p>

      <div style={{ textAlign: "left", margin: "20px 0" }}>
        <label htmlFor="negotiation-agent">Select AI agent</label>
        <select
          id="negotiation-agent"
          value={selectedAgentId}
          onChange={(event) => setSelectedAgentId(event.target.value)}
          disabled={loading}
          style={{ display: "block", width: "100%", padding: 12, marginTop: 8 }}
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} — {settings?.[agent.id] || agent.personality || "Collaborative"}
            </option>
          ))}
        </select>
      </div>

      <div
        aria-live="polite"
        style={{
          textAlign: "left",
          minHeight: 180,
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          margin: "20px 0",
        }}
      >
        {messages.length === 0 && (
          <p>Your conversation will appear here. Send your opening offer below.</p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              background: message.role === "user" ? "#e8f2ff" : "#f1f1f1",
              color: "#222",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>
              {message.agentName ||
  (message.role === "user" ? "You" : selectedAgent?.name || "AI Agent")}
            </strong>
            <div style={{ marginTop: 6 }}>{message.text}</div>
          </div>
        ))}

        {loading && <p>Waiting for the AI agent to respond...</p>}
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {isAiVsAi && (
  <div style={{ marginBottom: 16 }}>
    <button
      type="button"
      className="continue-button"
      onClick={runAiSimulation}
      disabled={loading || simulationRunning || !started}
    >
      {simulationRunning
        ? "AI Agents Negotiating..."
        : "Start AI vs AI Simulation"}
    </button>
  </div>
)}
      <form onSubmit={sendMessage}>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Enter your offer or message..."
          maxLength={3000}
          rows={3}
          disabled={loading || !started}
          style={{ boxSizing: "border-box", width: "100%", padding: 12 }}
        />

        <div className="agent-actions" style={{ marginTop: 12 }}>
          <button
            type="submit"
            className="continue-button"
            disabled={loading || !started || !draft.trim() || !selectedAgent}
          >
            {loading ? "Waiting for AI..." : "Send Message"}
          </button>
          <button type="button" className="back-button" onClick={onBack}>
            Review settings
          </button>
          <button type="button" className="back-button" onClick={onRestart}>
            Choose another scenario
          </button>
        </div>
      </form>
    </div>
  );
}



function ComingSoonPage({ title, onBack }) {
  const isReports = title === "Reports";

  const [reports, setReports] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("negotiationReports") || "[]");
      // Convert reports saved by the older version into one-message sessions for compatibility.
      return stored.map((report, index) => {
        if (Array.isArray(report.messages)) return report;
        return {
          id: report.id ?? `legacy-${index}`,
          date: report.date || new Date().toISOString(),
          updatedAt: report.date || new Date().toISOString(),
          mode: "Human vs AI",
          scenario: report.scenario || "Unknown scenario",
          scenarioId: "legacy",
          agents: [{ name: report.agent || "AI Agent", role: "Negotiation agent", personality: "Unknown" }],
          messages: [
            ...(report.userMessage ? [{ role: "user", agentName: "You", text: report.userMessage }] : []),
            ...(report.reply ? [{ role: "model", agentName: report.agent || "AI Agent", text: report.reply }] : []),
          ],
        };
      });
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState(() => {
    const defaults = {
      defaultAgent: "Project Manager — Collaborative",
      responseStyle: "Balanced",
      responseLength: "Medium",
    };

    try {
      return {
        ...defaults,
        ...JSON.parse(
          localStorage.getItem("negotiationPreferences") || "{}"
        ),
      };
    } catch {
      return defaults;
    }
  });

  const [saveMessage, setSaveMessage] = useState("");

  function updatePreference(event) {
    const { name, value } = event.target;

    setPreferences((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaveMessage("");
  }

  function savePreferences(event) {
    event.preventDefault();

    try {
      localStorage.setItem(
        "negotiationPreferences",
        JSON.stringify(preferences)
      );

      setSaveMessage("Settings saved successfully!");
    } catch {
      setSaveMessage("Could not save settings. Please try again.");
    }
  }

  function downloadReports() {
    const content = reports
      .map((report) => [
        `Session: ${report.id}`,
        `Date: ${new Date(report.date).toLocaleString()}`,
        `Mode: ${report.mode || "Negotiation"}`,
        `Scenario: ${report.scenario}`,
        `Agents: ${(report.agents || []).map((agent) => `${agent.name} (${agent.role}) — ${agent.personality}`).join(", ") || "Not recorded"}`,
        "Conversation:",
        ...(report.messages || []).map((message) => `${message.agentName || (message.role === "user" ? "You" : "AI")}: ${message.text}`),
        "----------------------------------------",
      ].join("\n"))
      .join("\n\n");

    const blob = new Blob(
      [content || "No negotiation reports available."],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "negotiation-reports.txt";
    link.click();

    URL.revokeObjectURL(url);
  }

  function clearReports() {
    if (window.confirm("Delete all saved negotiation reports?")) {
      localStorage.removeItem("negotiationReports");
      setReports([]);
    }
  }

  return (
    <div className="placeholder-page">
      <div className="large-page-icon">✧</div>
      <h1>{title}</h1>

      {isReports ? (
        <div className="feature-content" style={{ marginTop: 30 }}>
          <p>Review your saved negotiation exchanges.</p>
          <h3>Total negotiation sessions: {reports.length}</h3>

          {reports.length > 0 ? (
            <>
              <div className="feature-card">
                {reports.map((report) => (
                  <article key={report.id} style={{ padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                    <h3>{report.scenario}</h3>
                    <p><strong>Mode:</strong> {report.mode || "Human vs AI"}</p>
                    <p><strong>Date:</strong> {new Date(report.date).toLocaleString()}</p>
                    <p><strong>Agents:</strong> {(report.agents || []).map((agent) => `${agent.name} (${agent.role}) — ${agent.personality}`).join("; ") || "Agent details unavailable for an older report"}</p>
                    <p><strong>Messages:</strong> {(report.messages || []).length}</p>
                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                      {(report.messages || []).map((message, index) => (
                        <div key={`${report.id}-${index}`} style={{ background: message.role === "user" ? "#e8f2ff" : "#f1f1f1", color: "#222", padding: 12, borderRadius: 10, whiteSpace: "pre-wrap" }}>
                          <strong>{message.agentName || (message.role === "user" ? "You" : "AI Agent")}</strong>
                          <div style={{ marginTop: 5 }}>{message.text}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <button
                className="continue-button"
                onClick={downloadReports}
              >
                Download Reports
              </button>

              <button
                className="continue-button"
                onClick={clearReports}
              >
                Clear Reports
              </button>
            </>
          ) : (
            <p>
              No saved exchanges yet. Start a negotiation and send
              a message to create your first report.
            </p>
          )}
        </div>
      ) : (
        <div className="feature-content">
          <p>Customize your negotiation workspace.</p>

          <form
            className="feature-card"
            onSubmit={savePreferences}
          >
            <h3>Account</h3>
            <p>Your account is managed through Firebase Authentication.</p>

            <h3>Default AI Agent</h3>
            <select
              name="defaultAgent"
              value={preferences.defaultAgent}
              onChange={updatePreference}
            >
              <option value="Project Manager — Collaborative">
                Project Manager — Collaborative
              </option>
              <option value="Department Representative — Risk-Averse">
                Department Representative — Risk-Averse
              </option>
            </select>

            <h3>Negotiation Response Style</h3>
            <select
              name="responseStyle"
              value={preferences.responseStyle}
              onChange={updatePreference}
            >
              <option value="Collaborative">Collaborative</option>
              <option value="Balanced">Balanced</option>
              <option value="Firm">Firm</option>
            </select>

            <h3>Response Length</h3>
            <select
              name="responseLength"
              value={preferences.responseLength}
              onChange={updatePreference}
            >
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Detailed">Detailed</option>
            </select>

            <button
              type="submit"
              className="continue-button"
            >
              Save Settings
            </button>

            {saveMessage && (
              <p role="status">{saveMessage}</p>
            )}
          </form>
        </div>
      )}

      <button
        className="continue-button"
        onClick={onBack}
      >
        Back to scenarios →
      </button>
    </div>
  );
}









export default App;

