import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppSetting } from "./App-setting";

function MainHeader() {
  const {
    user,
    modelList,
    updateList,
    currentModel,
    changeModel,
    apiUrl,
    isStream,
    updateStream,
    setUser,
    mode,
    setMode,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    systemTemplate,
    setSystemTemplate,
    roleTemplates, // ✅ Use from context
  } = useContext(AppSetting);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchModels = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tags`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!mounted) return;
        if (Array.isArray(data.models) && data.models.length > 0) {
          updateList(data.models);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };

    // Fetch on mount
    fetchModels();

    // Refetch when window/tab gains focus (useful if backend or Ollama wasn't ready at first)
    const onFocus = () => {
      fetchModels();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [apiUrl, updateList]);

  const handleLogout = () => {
    setUser({});
    try {
      localStorage.removeItem("user");
    } catch (e) {}
    navigate("/");
  };

  return (
    <header className="bg-light border-bottom py-3 px-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <Link to="/" className="text-dark fw-bold fs-4 text-decoration-none">
            ChatApp
          </Link>
        </div>

        <div className="text-center my-2 flex-grow-1">
          <span className="fw-semibold">
            {user ? `Hi, ${user.username}!` : "Welcome"}
          </span>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Model Dropdown */}
          <div>
            <label htmlFor="model-select" className="me-2 fw-medium">
              Model:
            </label>
            <select
              id="model-select"
              onChange={changeModel}
              value={currentModel}
              className="form-select form-select-sm"
            >
              {!modelList || modelList.length === 0 ? (
                <option disabled value="">{`Loading models...`}</option>
              ) : (
                <>
                  <option value="">
                    Select model
                  </option>
                  {modelList.map(({ name, model, size }, i) => {
                    // Extract base name and version from full name (e.g., "llama3.2:1b" -> "llama3.2" + "1b")
                    const [baseName, version] = String(name).split(":");
                    // Display format: "llama3.2 (1.2B)" or "llama3.2:1b (1.2B)"
                    const displayName = size 
                      ? `${baseName}${version ? `:${version}` : ''} (${size})`
                      : name;
                    return (
                      <option key={i} value={model}>
                        {displayName}
                      </option>
                    );
                  })}
                </>
              )}
            </select>
          </div>

          {/* Role/Template Dropdown */}
          <div>
            <label htmlFor="template-select" className="me-2 fw-medium">
              Role:
            </label>
            <select
              id="template-select"
              onChange={(e) => setSystemTemplate(e.target.value)}
              value={systemTemplate}
              className="form-select form-select-sm"
            >
              {roleTemplates.map((tpl, i) => (
                <option key={i} value={tpl.value}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Toggle */}
          <div className="btn-group" role="group" aria-label="Mode selection">
            <button
              type="button"
              className={`btn btn-sm ${mode === "chat" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setMode("chat")}
              aria-pressed={mode === "chat"}
              title="Chat mode: Quick, conversational responses"
            >
              💬 Chat
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === "generate" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setMode("generate")}
              aria-pressed={mode === "generate"}
              title="Generate mode: Long-form, detailed content"
            >
              📝 Generate
            </button>
          </div>

          {/* Temperature Control */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="temperature" className="small mb-0" style={{ whiteSpace: "nowrap" }}>
              Temp: {temperature.toFixed(1)}
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="form-range"
              style={{ width: "80px" }}
              title="Temperature: Lower = more focused, Higher = more creative"
            />
          </div>

          {/* Max Tokens Control */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="maxTokens" className="small mb-0" style={{ whiteSpace: "nowrap" }}>
              Tokens:
            </label>
            <input
              id="maxTokens"
              type="number"
              min="50"
              max="4000"
              step="50"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 500)}
              className="form-control form-control-sm"
              style={{ width: "80px" }}
              title="Maximum tokens in response"
            />
          </div>

          {/* Stream Toggle */}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => updateStream((stream) => !isStream)}
            aria-pressed={isStream}
          >
            Stream: {isStream ? "On" : "Off"}
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
