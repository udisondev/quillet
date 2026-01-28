import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { MainLayout } from "./components/layout/MainLayout";
import { useIdentityStore } from "./store/useIdentityStore";
import { useChatSummariesStore } from "./store/useChatSummariesStore";
import { useContactsStore } from "./store/useContactsStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { useEventSubscriptions } from "./hooks/useEventSubscriptions";
import {
  getIdentity,
  getContacts,
  getChatSummaries,
  getSettings,
} from "./services/api";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setIdentity = useIdentityStore((s) => s.setIdentity);
  const setContacts = useContactsStore((s) => s.setContacts);
  const setSummaries = useChatSummariesStore((s) => s.setSummaries);
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEventSubscriptions();

  useEffect(() => {
    Promise.all([
      getIdentity(),
      getContacts(),
      getChatSummaries(),
      getSettings(),
    ])
      .then(([identity, contacts, summaries, settings]) => {
        setIdentity(identity);
        setContacts(contacts);
        setSummaries(summaries);
        setSettings(settings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("failed to load initial data:", err);
        setError(String(err));
        setLoading(false);
      });
  }, [setIdentity, setContacts, setSummaries, setSettings]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <Typography color="error">Failed to load: {error}</Typography>
      </Box>
    );
  }

  return <MainLayout />;
}

export default App;
