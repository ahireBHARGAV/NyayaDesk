import { createRoot } from "react-dom/client";
import App, {
  CourtOtherHelper,
  DemoAuthHelper,
  
  ProfileCourtHelper,
  ProfileLogoutHelper,
  ScheduleCaseNavigator,
  SidebarProfileName,
} from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <>
        <CourtOtherHelper />
    <ScheduleCaseNavigator />
    <ProfileCourtHelper />
    <SidebarProfileName />
    <ProfileLogoutHelper />
    <DemoAuthHelper />
    <App />
  </>,
);
