import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/auth";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Login successful");
    } catch (err) {
      console.log(err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <form onSubmit={submit} style={{ padding: 24 }}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <br />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <br />
      <button type="submit">Login</button>
    </form>
  );
}