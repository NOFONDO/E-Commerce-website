import { useState } from "react";
import { supabase } from "./supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // SIMPLE email format check
  const isValidEmail = (email) => {
    return email.includes("@") && email.includes(".");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // -------- FORM VALIDATION --------
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    // -------- END VALIDATION --------

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      switch (error.code) {
        case "invalid_credentials":
          setErrorMessage("Invalid email or password.");
          break;
        default:
          setErrorMessage("Login failed. Please try again.");
      }
    } else {
      console.log("Login successful");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-bold">Login</h2>

        {errorMessage && (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Login;
