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
    let mounted = true;

    const fetchModels = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tags`, { credentials: 'include' });
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
    window.addEventListener('focus', onFocus);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [apiUrl, updateList]);

  const handleLogout = () => {
    setUser({});
    try { localStorage.removeItem('user'); } catch (e) { }
    navigate("/");
  };

  return (
    <header className="bg-light border-bottom py-3 px-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <Link to="/" className="text-dark fw-bold fs-4 text-decoration-none">ChatApp</Link>
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
              {(!modelList || modelList.length === 0) ? (
                <option disabled value="">{`Loading models...`}</option>
              ) : (
                modelList.map(({ name, model }, i) => (
                  <option key={i} value={model}>
                    {String(name).split(":")[0]}
                  </option>
                ))
              )}
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
