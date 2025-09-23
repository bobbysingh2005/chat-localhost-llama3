import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate(); // Call useNavigate at the top level

  const nav = (to) => {
    // Define the navigation function
    navigate(to); // Use it to navigate
  };

  return (
    <>
      <h1>Home</h1>

      <button type="button" onClick={() => nav("/chat")}>
        Start Chat / Generate
      </button>
    </>
  );
}
