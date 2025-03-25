import { useEffect, useState } from "react";

export default function AuthButton() {
  const [responseJWT, setResponseJWT] = useState("");
  const [decodedJWT, setDecodedJWT] = useState(null);

  useEffect(() => {
    function decodeJWT(token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
      } catch (error) {
        console.error("Error decoding JWT", error);
        return null;
      }
    }

    function handleCredentialResponse(response) {
      console.log("Encoded JWT ID token:", response.credential);
      setResponseJWT(response?.credential);
      setDecodedJWT(decodeJWT(response?.credential));
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("buttonDiv"),
          { theme: "outline", size: "large" }
        );
        
        window.google.accounts.id.prompt();
      }
    };
    
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div id="buttonDiv"></div>
      {responseJWT && <p>JWT Token: {responseJWT}</p>}
      {decodedJWT && (
        <div>
          <h3>Decoded JWT:</h3>
          <pre>{JSON.stringify(decodedJWT, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

