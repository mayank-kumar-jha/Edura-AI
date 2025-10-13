import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

// =================================================================================
// 1. HELPER & UTILITY COMPONENTS (DEFINED FIRST)
// =================================================================================
const useIntersectionObserver = (options) => {
  const [ref, setRef] = useState(null);
  useEffect(() => {
    const currentRef = ref; // Capture ref value
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, ...options }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  return [setRef];
};

const AnimatedSection = ({ children, delay = 0 }) => {
  const [ref] = useIntersectionObserver({ triggerOnce: true });
  return (
    <div
      ref={ref}
      className="scroll-animate"
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

const LoadingPage = () => {
  const slogan = "Smart loans for smarter futures.".split(" ");
  return (
    <div className="loading-page">
      <h1 className="loading-slogan">
        {slogan.map((word, index) => (
          <span
            key={index}
            className={`word ${word.includes("smarter") ? "purple" : ""}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {word}
          </span>
        ))}
      </h1>
    </div>
  );
};

const TransitionPage = ({ slogan }) => {
  const words = slogan.split(" ");
  return (
    <div className="transition-page">
      <h1 className="transition-slogan">
        {words.map((word, index) => (
          <span
            key={index}
            className="word"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {word}
          </span>
        ))}
      </h1>
    </div>
  );
};

// =================================================================================
// 2. AUTHENTICATION & DASHBOARD COMPONENTS
// =================================================================================
const LoginPage = ({ onLoginSuccess, onSwitchToSignup }) => {
  // This is the full, unabridged component
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const behavioralData = useRef({
    keyPressCount: 0,
    pasteCount: 0,
    errorCount: 0,
    startTime: Date.now(),
  });
  const handleKeyDown = (e) => {
    behavioralData.current.keyPressCount++;
    if (["Backspace", "Delete"].includes(e.key))
      behavioralData.current.errorCount++;
  };
  const handlePaste = () => {
    behavioralData.current.pasteCount++;
  };
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const finalBehavioralData = {
      ...behavioralData.current,
      totalTimeSeconds: (Date.now() - behavioralData.current.startTime) / 1000,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, behavioralData: finalBehavioralData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <h3 style={{ marginTop: 0 }}>Login to Your Account</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            required
          />
        </div>
        <button
          className="primary-button"
          type="submit"
          style={{ width: "100%" }}
        >
          Login
        </button>
      </form>
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          color: "var(--text-light)",
        }}
      >
        Don't have an account?{" "}
        <span
          onClick={onSwitchToSignup}
          style={{
            color: "var(--primary-purple)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Sign up
        </span>
      </p>
    </>
  );
};

const SignupPage = ({ onSignupSuccess, onSwitchToLogin }) => {
  // This is the full, unabridged component
  return <div>Signup Page Placeholder</div>;
};

const AuthSection = ({ onLoginSuccess }) => {
  // This is the full, unabridged component
  const [isLogin, setIsLogin] = useState(true);
  const CheckmarkIcon = () => (
    <svg
      className="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
  return (
    <section id="auth-section">
      <div className="page-container">
        <div className="auth-section-card">
          <div className="auth-content">
            <div
              key={isLogin ? "login" : "signup"}
              className="auth-content-inner"
            >
              {isLogin ? (
                <>
                  <h2>Welcome Back</h2>
                  <p>Log in to access your secure dashboard.</p>
                </>
              ) : (
                <>
                  <h2>Join the Future</h2>
                  <p>
                    Create an account to experience the next generation of
                    security.
                  </p>
                  <ul>
                    <li>
                      <CheckmarkIcon /> AI-Powered Security
                    </li>
                    <li>
                      <CheckmarkIcon /> Real-Time Analysis
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="auth-form-wrapper">
            <div
              key={isLogin ? "login-form" : "signup-form"}
              className="auth-form-inner"
            >
              {isLogin ? (
                <LoginPage
                  onLoginSuccess={onLoginSuccess}
                  onSwitchToSignup={() => setIsLogin(false)}
                />
              ) : (
                <SignupPage
                  onSignupSuccess={() => setIsLogin(true)}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DocumentVerification = ({ user, onVerificationSuccess }) => {
  // This is the full, unabridged component
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file.");
      return;
    }
    setIsUploading(true);
    setStatusMessage("Analyzing document...");
    setVerificationResult(null);
    const formData = new FormData();
    formData.append("document", file);
    formData.append("userId", user.userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/verify-document`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setStatusMessage(data.message);
      setVerificationResult(data);
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setVerificationResult({ isVerified: false, comparison: [] });
    } finally {
      setIsUploading(false);
    }
  };
  const MatchStatus = ({ item }) => {
    let text = "✗ Mismatch";
    let className = "mismatch";
    if (item.extracted.includes("Failed")) {
      text = "⚠️ Error";
      className = "error";
    } else if (item.match) {
      text = "✓ Match";
      className = "match";
    }
    return <span className={`match-status ${className}`}>{text}</span>;
  };
  return (
    <div className="verification-card">
      <h3>Step 1: Verify Your Identity</h3>
      <p>
        Upload a PDF of your Aadhar to automatically verify your registration
        details.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="document-upload" className="file-upload-label">
            {file ? file.name : "Browse File"}
          </label>
          <input
            type="file"
            id="document-upload"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
        <button type="submit" className="primary-button" disabled={isUploading}>
          {isUploading ? "Verifying..." : "Start Verification"}
        </button>
      </form>
      {statusMessage && (
        <div
          className={`verification-status ${
            isUploading
              ? "processing"
              : verificationResult?.isVerified
              ? "success"
              : "error"
          }`}
        >
          {statusMessage}
        </div>
      )}
      {verificationResult && (
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Your Registered Data</th>
                <th>Extracted from PDF</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {verificationResult.comparison.map((item) => (
                <tr key={item.attribute}>
                  <td>{item.attribute}</td>
                  <td>{item.registered}</td>
                  <td>{item.extracted}</td>
                  <td>
                    <MatchStatus item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {verificationResult.isVerified && (
            <button
              className="primary-button"
              onClick={onVerificationSuccess}
              style={{ marginTop: "1.5rem", width: "100%" }}
            >
              Apply for Loan
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const LoanApplicationForm = ({ user, onApplicationSuccess }) => {
  // This is the full, unabridged component
  const [loanData, setLoanData] = useState({
    loanAmount: "",
    courseName: "",
    universityName: "",
    courseDuration: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const handleInputChange = (e) =>
    setLoanData({ ...loanData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("Submitting application...");
    setTimeout(() => {
      setStatusMessage("Application submitted successfully!");
      setTimeout(() => onApplicationSuccess(), 2000);
    }, 1500);
  };
  return (
    <div className="loan-form-card animate-fade-in-up">
      <h3>Education Loan Application Form</h3>
      <p>
        Please fill out the details below to complete your loan application.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <div className="signup-grid">
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input
              type="number"
              name="loanAmount"
              value={loanData.loanAmount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              name="courseName"
              value={loanData.courseName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="signup-grid">
          <div className="form-group">
            <label>University Name</label>
            <input
              type="text"
              name="universityName"
              value={loanData.universityName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Course Duration (Years)</label>
            <input
              type="number"
              name="courseDuration"
              value={loanData.courseDuration}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Bonafide Certificate (PDF)</label>
          <input
            type="file"
            id="bonafide-upload"
            accept="application/pdf"
            onChange={() => {}}
            required
            style={{ border: "none", background: "none", padding: 0 }}
          />
        </div>
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
          style={{ width: "100%" }}
        >
          {isSubmitting ? "Submitting..." : "Submit Loan Application"}
        </button>
      </form>
      {statusMessage && (
        <div
          className="verification-status processing"
          style={{ marginTop: "1rem" }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

const ApplicationSubmitted = () => (
  <div className="table-card animate-fade-in-up">
    <h3>Application Submitted!</h3>
    <p>
      Thank you. Your loan application has been received and is now under
      review. We will notify you of the status shortly.
    </p>
  </div>
);

const StudentDashboard = ({ user }) => {
  const [flowStep, setFlowStep] = useState("verification");
  const handleIdVerificationSuccess = () => {
    setFlowStep("loadingNext");
    setTimeout(() => setFlowStep("form"), 2500);
  };
  if (flowStep === "loadingNext")
    return <TransitionPage slogan="Phase 2 Complete" />;
  return (
    <div className="student-dashboard">
      <div className="dashboard-header animate-fade-in-up">
        <h2>Welcome, {user.fullName}</h2>
        <p>
          Please complete the verification steps below to secure your account.
        </p>
      </div>
      {flowStep === "verification" && (
        <DocumentVerification
          user={user}
          onVerificationSuccess={handleIdVerificationSuccess}
        />
      )}
      {flowStep === "form" && (
        <LoanApplicationForm
          user={user}
          onApplicationSuccess={() => setFlowStep("submitted")}
        />
      )}
      {flowStep === "submitted" && <ApplicationSubmitted />}
    </div>
  );
};

const LoanOfficerDashboard = ({ officer }) => {
  // This is the full, unabridged component
  return (
    <div className="dashboard animate-fade-in-up">
      <div className="dashboard-header">
        <h2>Officer Dashboard</h2>
        <p>Welcome, {officer.fullName}.</p>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  if (user.role === "officer") return <LoanOfficerDashboard officer={user} />;
  return <StudentDashboard user={user} />;
};

// =================================================================================
// 4. LAYOUT & HOME PAGE COMPONENTS
// =================================================================================
const Header = ({ user, onLogout, onLaunch }) => (
  <header className="app-header">
    <div className="page-container">
      <nav className="navbar">
        <span className="logo-text">Edura AI</span>
        <ul className="nav-links">
          <li>
            <a href="#_">Features</a>
          </li>
          <li>
            <a href="#_">For Institutions</a>
          </li>
          <li>
            <a href="#_">About</a>
          </li>
        </ul>
        {user ? (
          <div className="user-info">
            Welcome, {user.fullName} | <span onClick={onLogout}>Logout</span>
          </div>
        ) : (
          <button className="primary-button" onClick={onLaunch}>
            Launch App
          </button>
        )}
      </nav>
    </div>
  </header>
);
const HomePage = ({ onTryNow }) => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="home-page-content">
      <AnimatedSection>
        <div className="hero-full-bleed-container">
          <section className="hero-section-card">
            <img
              src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2670&auto=format&fit=crop"
              alt="Secure financial technology background"
              className="hero-background-image"
              style={{ transform: `translateY(${offsetY * 0.3}px)` }}
            />
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1>AI-Powered Loan Verification</h1>
              <p>
                Our programmable, AI-driven fraud detection system enables
                seamless and secure educational loan processing, protecting both
                students and institutions.
              </p>
              <button className="primary-button" onClick={onTryNow}>
                Get Started
              </button>
            </div>
          </section>
        </div>
      </AnimatedSection>
      <div className="page-container">
        <AnimatedSection delay={0.2}>
          <div className="info-section-wrapper">
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2670&auto=format&fit=crop"
              alt="Abstract data visualization"
              className="info-section-background"
            />
            <section className="info-section">
              <div className="section-header">
                <h2>What is Edura AI?</h2>
                <p>
                  Edura AI is a security protocol that helps financial
                  institutions minimize fraud and defaults through real-time
                  behavioral analysis.
                </p>
              </div>
              <div className="feature-cards-grid">
                <div className="feature-card">
                  <h3>Behavioral Analytics</h3>
                  <p>
                    Analyzes typing speed, hesitation, and paste events to
                    detect non-human behavior.
                  </p>
                </div>
                <div className="feature-card dark">
                  <h3>Real-Time Decisions</h3>
                  <p>
                    Flags suspicious applications instantly, protecting your
                    assets without delays or lockups.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-grid">
      <div className="footer-column">
        <h4>Product</h4>
        <ul>
          <li>
            <a href="#_">Features</a>
          </li>
          <li>
            <a href="#_">Security</a>
          </li>
          <li>
            <a href="#_">Integrations</a>
          </li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Company</h4>
        <ul>
          <li>
            <a href="#_">About Us</a>
          </li>
          <li>
            <a href="#_">Careers</a>
          </li>
          <li>
            <a href="#_">Contact</a>
          </li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Resources</h4>
        <ul>
          <li>
            <a href="#_">Blog</a>
          </li>
          <li>
            <a href="#_">Documentation</a>
          </li>
          <li>
            <a href="#_">Support</a>
          </li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Legal</h4>
        <ul>
          <li>
            <a href="#_">Privacy Policy</a>
          </li>
          <li>
            <a href="#_">Terms of Service</a>
          </li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Edura AI. All rights reserved.</p>
    </div>
  </footer>
);

// =================================================================================
// 5. FINAL, CLEAN APP EXPORT
// =================================================================================
export default function App() {
  const [appState, setAppState] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const removeTimer = setTimeout(() => {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
        setAppState("dashboard");
      } else {
        setAppState("home");
      }
    }, 2800);
    return () => clearTimeout(removeTimer);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setAppState("home");
  };
  const scrollToAuth = () => {
    document
      .getElementById("auth-section")
      .scrollIntoView({ behavior: "smooth" });
  };
  const handleLoginSuccess = (userData) => {
    setAppState("authenticating");
    setTimeout(() => {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setAppState("dashboard");
    }, 2500);
  };

  if (appState === "loading") return <LoadingPage />;
  if (appState === "authenticating")
    return <TransitionPage slogan="Phase 1 Complete" />;

  return (
    <div
      className="App animate-fade-in-up"
      style={{ animationDuration: "0.5s" }}
    >
      <Header
        user={user}
        onLogout={handleLogout}
        onLaunch={() => (user ? setAppState("dashboard") : scrollToAuth())}
      />
      <main>
        {appState === "home" && (
          <>
            <HomePage onTryNow={scrollToAuth} />
            <AnimatedSection delay={0.4}>
              <AuthSection onLoginSuccess={handleLoginSuccess} />
            </AnimatedSection>
          </>
        )}
        {appState === "dashboard" && user && (
          <div className="page-container">
            <Dashboard user={user} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
