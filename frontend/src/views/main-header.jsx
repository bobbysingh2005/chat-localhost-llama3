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
    systemTemplate,
    setSystemTemplate,
    roleTemplates, // ✅ Use from context
  } = useContext(AppSetting);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tags`);
        const data = await response.json();
        if (Array.isArray(data.models)) {
          updateList(data.models);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };

    fetchModels();
  }, [apiUrl, updateList]);

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-light border-bottom py-3 px-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <Link to="/" className="text-dark fw-bold fs-4 text-decoration-none">ChatApp</Link>
          <nav className="d-flex gap-3">
            <Link to="/" className="text-decoration-none">Home</Link>
            <Link to="/chat" className="text-decoration-none">Chat</Link>
            <Link to="/generate" className="text-decoration-none">Generate</Link>
          </nav>
        </div>

        <div className="text-center my-2 flex-grow-1">
          <span className="fw-semibold">
            {user ? `Hi, ${user.username}!` : "Welcome"}
          </span>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Model Dropdown */}
          <div>
            <label htmlFor="model-select" className="me-2 fw-medium">Model:</label>
            <select
              id="model-select"
              onChange={changeModel}
              value={currentModel}
              className="form-select form-select-sm"
            >
              {modelList.map(({ name, model }, i) => (
                <option key={i} value={model}>
                  {name.split(":")[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Role/Template Dropdown */}
          <div>
            <label htmlFor="template-select" className="me-2 fw-medium">Role:</label>
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

          {/* Stream & Logout */}
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
