import { createBrowserRouter } from "react-router-dom";
import HomePage       from "./pages/HomePage";
import TeamPage       from "./pages/TeamPage";
import ApproachPage   from "./pages/ApproachPage";

// Add other existing routes below as they existed before
// (ProvingGrounds registration, etc. — do not remove those)

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/team",
    element: <TeamPage />,
  },
  {
    path: "/approach",
    element: <ApproachPage />,
  },
]);

export default router;
