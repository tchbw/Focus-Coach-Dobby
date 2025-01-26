import DobbyViolationPopup from "@renderer/components/pages/DobbyViolationPopup";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

function InnerApp(): JSX.Element | null {
  async function getViolationString(): Promise<string> {
    return await window.api.getDobbyViolationString();
  }

  const query = useQuery({
    queryKey: [`getDobbyViolationString`],
    queryFn: getViolationString,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (query.isPending) return null;

  if (query.isError) return null;

  return <DobbyViolationPopup violationString={query.data} />;
}

export default App;
