import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GetIdentity } from "@wailsjs/go/main/App";

function App() {
  const [displayName, setDisplayName] = useState("...");

  useEffect(() => {
    GetIdentity()
      .then((user) => setDisplayName(user.displayName))
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setDisplayName(`Error: ${message}`);
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 3,
        p: 4,
      }}
    >
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
        Quillet
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome, {displayName}
      </Typography>
    </Box>
  );
}

export default App;
