import { createRoot } from "react-dom/client";
import App, {
  CourtOtherHelper,
  DemoAuthHelper,
  FrontendDummyData,
  ProfileCourtHelper,
  ProfileLogoutHelper,
  ScheduleCaseNavigator,
  SidebarProfileName,
} from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <>
    <FrontendDummyData />
    <CourtOtherHelper />
    <ScheduleCaseNavigator />
    <ProfileCourtHelper />
    <SidebarProfileName />
    <ProfileLogoutHelper />
    <DemoAuthHelper />
    <App />
  </>,
);
