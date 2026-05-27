import Navbar from "../components/Navbar";

export default function MainLayout({

  children,

}) {

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >

      <Navbar />

      <div
        style={{
          padding: "24px",
        }}
      >

        {children}

      </div>

    </div>
  );
}