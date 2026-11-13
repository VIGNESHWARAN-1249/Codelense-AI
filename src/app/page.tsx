
"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bug,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Cpu,
  FileCode2,
  Github,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const languages = [
  "Java",
  "Python",
  "C++",
  "JavaScript",
  "TypeScript",
  "C",
  "Go",
  "PHP",
];

export default function Home() {
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleLanguageChange(newLanguage: string) {
    setLanguage(newLanguage);
    setCode("");
    setReview("");
    setError("");
    setCopied(false);
  }

  async function runReview() {
    setError("");
    setReview("");
    setCopied(false);

    if (!code.trim()) {
      setError("Please paste some code before starting the review.");
      return;
    }

    if (code.length > 20000) {
      setError("Code is too long. Maximum limit is 20,000 characters.");
      return;
    }

    setLoading(true);

    let result = "";

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.error || `Request failed with status ${response.status}.`
        );
      }

      if (!response.body) {
        throw new Error("Unable to read the server response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        result += decoder.decode(value, { stream: true });
        setReview(result);
      }

      result += decoder.decode();
      setReview(result);

      if (!result.trim()) {
        throw new Error(
          "The AI returned an empty response. Please try again."
        );
      }
    } catch (err) {
      console.error("Review error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyReview() {
    if (!review) return;

    try {
      await navigator.clipboard.writeText(review);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setError("Unable to copy the review.");
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">
            <Code2 size={21} />
          </span>
          <span>
            CodeLens<span className="brand-ai"> AI</span>
          </span>
        </a>

        <nav>
          <a className="nav-active" href="#review">
            Code review
          </a>
          <a href="#how">How it works</a>
        </nav>

        <div className="top-right">
          <span className="status-dot" />
          AI reviewer
          <span className="top-divider" />
          <span className="version">BETA</span>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">CODE REVIEW TOOL</div>

        <h1>
          Find problems in your code.
          <br />
          <span>Fix them before they grow.</span>
        </h1>

        <p className="hero-copy">
          Paste your code and understand
          what needs to be improved.
        </p>

        <div className="hero-pills">
          <span>Bug detection</span>
          <span>Code suggestions</span>
          <span>Complexity analysis</span>
        </div>
      </section>

      <section className="workspace" id="review">
        <div className="panel editor-panel">
          <div className="panel-head">
            <div className="panel-title">
              <FileCode2 size={17} />
              <span>Your code</span>
              <span className="subtle-tag">EDITOR</span>
            </div>

            <label className="language-select">
              <span>{language}</span>
              <ChevronDown size={14} />

              <select
                aria-label="Programming language"
                value={language}
                disabled={loading}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="editor-meta">
            <span>
              <span className="live-dot" />
              Ready for review
            </span>

            <span>{code.length.toLocaleString()} / 20,000 chars</span>
          </div>

          <div className="code-wrap">
            <div className="line-numbers">
              {code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>

            <textarea
              spellCheck={false}
              aria-label="Code to review"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Enter your ${language} code here...`}
              disabled={loading}
            />
          </div>

          <div className="editor-foot">
            <span>
              <span className="keycap">⌘</span> Paste your code to get started
            </span>

            <button
              className="clear-btn"
              onClick={() => {
                setCode("");
                setError("");
                setReview("");
                setCopied(false);
              }}
              disabled={loading}
            >
              Clear code
            </button>
          </div>

          <button
            className="review-btn"
            onClick={runReview}
            disabled={loading}
          >
            <Sparkles size={17} />

            {loading ? "Reviewing your code..." : "Review my code"}

            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>

          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}

          <p className="privacy-note">
            <ShieldCheck size={13} />
            Your code is sent for analysis.
          </p>
        </div>

        <div className="panel results-panel">
          <div className="panel-head">
            <div className="panel-title">
              <span className="result-icon">
                <Sparkles size={15} />
              </span>
              <span>Review results</span>
            </div>

            <span className="subtle-tag">AI ANALYSIS</span>
          </div>

          {!review && !loading ? (
            <div className="empty-state">
              <div className="empty-art">
                <div className="empty-ring ring-one" />
                <div className="empty-ring ring-two" />

                <div className="empty-center">
                  <Cpu size={31} />
                </div>

                <span className="spark spark-a">✳</span>
                <span className="spark spark-b">✦</span>
              </div>

              <h3>Your code review starts here</h3>

              <p>
                Submit your code and CodeLens AI will inspect it for bugs,
                readability, performance, and complexity.
              </p>

              <div className="result-checks">
                <span>
                  <Check size={14} /> Potential bugs
                </span>
                <span>
                  <Check size={14} /> Suggested fixes
                </span>
                <span>
                  <Check size={14} /> Complexity insights
                </span>
              </div>
            </div>
          ) : (
            <div className="review-output">
              {loading && !review && (
                <div className="loading-label">
                  <LoaderCircle className="spin" size={15} />
                  Connecting to AI reviewer...
                </div>
              )}

              <div className="markdown-output">
                {review}
              </div>

              {loading && review && (
                <div className="loading-label">
                  <LoaderCircle className="spin" size={15} />
                  Receiving review...
                </div>
              )}

              {review && !loading && (
                <button className="copy-btn" onClick={copyReview}>
                  {copied ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}

                  {copied ? "Copied" : "Copy review"}
                </button>
              )}
            </div>
          )}

          <div className="results-bottom">
            <span>
              <span className="status-dot" />
              Powered by Groq
            </span>

            <span>AI can make mistakes — verify suggestions.</span>
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-kicker">SIMPLE BY DESIGN</div>

        <h2>From code to clarity in three steps.</h2>

        <div className="steps">
          <article>
            <div className="step-icon">
              <Code2 size={20} />
            </div>
            <span>01</span>
            <h3>Paste your code</h3>
            <p>
              Choose your programming language and add the code you want
              reviewed.
            </p>
          </article>

          <article>
            <div className="step-icon">
              <Sparkles size={20} />
            </div>
            <span>02</span>
            <h3>Let AI analyse</h3>
            <p>
              CodeLens checks logic, potential bugs, readability, and
              performance.
            </p>
          </article>

          <article>
            <div className="step-icon">
              <Bug size={20} />
            </div>
            <span>03</span>
            <h3>Improve with insight</h3>
            <p>
              Get clear explanations and actionable recommendations to
              improve your code.
            </p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">
            <Code2 size={17} />
          </span>
          CodeLens<span className="brand-ai"> AI</span>
        </a>

        <span>Built for developers who love better code.</span>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <Github size={17} />
        </a>
      </footer>
    </main>
  );
}
