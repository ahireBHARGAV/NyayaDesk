import { createContext, useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Login, Role, Signup } from "./pages/public/Auth";
import { CaseLookup, Public } from "./pages/public/Landing";
import { Advocate } from "./pages/advocate/Dashboard";
import { Authority } from "./pages/authority/Authority";

export const DataContext = createContext({
  cases: [],
  hearings: [],
  courtrooms: [],
  refresh: () => {},
});

export const Icon = ({ name, size = 18 }) => {
  const C = Icons[name] || Icons.Circle;
  return <C size={size} />;
};

export const Button = ({ children, variant = "", ...props }) => (
  <button className={`btn ${variant}`} {...props}>
    {children}
  </button>
);

export const Badge = ({ children }) => (
  <span
    className={`badge ${String(children).toLowerCase().replaceAll(" ", "-")}`}
  >
    {children}
  </span>
);

export const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export const openCaseDetails = (setPage, caseName) => {
  sessionStorage.setItem("nyaya_selected_case", caseName);
  setPage("Case Details");
};

export const advocateNav = [
  ["LayoutDashboard", "Dashboard"],
  ["BriefcaseBusiness", "My Cases"],
  ["CalendarDays", "Calendar"],
  ["FileUp", "e-Filing"],
  ["Files", "Documents"],
  ["Sparkles", "AI Document Assistant"],
  ["Scale", "Case Law Search"],
  ["Bell", "Notifications"],
];

export const authorityNav = [
  ["LayoutDashboard", "Dashboard"],
  ["Landmark", "Courtroom Management"],
  ["UserRoundCog", "Judge Allocation"],
  ["ListPlus", "Case Allocation"],
  ["CalendarRange", "Court Schedule"],
  ["Bell", "Notifications"],
  ["ClipboardList", "Activity Log"],
];

export const Stat = ({ icon, label, value, sub }) => (
  <article className="stat">
    <span>
      <Icon name={icon} />
    </span>
    <div>
      <b>{value}</b>
      <p>{label}</p>
      <small>{sub}</small>
    </div>
  </article>
);

export function PageTitle({ title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("public");
  const [role, setRole] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("nyaya_user"))?.role?.toLowerCase() ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [data, setData] = useState({ cases: [], hearings: [], courtrooms: [] });
  const [cnrQuery, setCnrQuery] = useState("");
  const go = (s) => {
    if (s === "advocate" || s === "authority") setRole(s);
    setScreen(s);
  };
  const refresh = () =>
    Promise.all(
      ["cases", "hearings", "courtrooms"].map((path) =>
        fetch(`/api/${path}/`).then((res) => (res.ok ? res.json() : [])),
      ),
    )
      .then(([cases, hearings, courtrooms]) =>
        setData({ cases, hearings, courtrooms }),
      )
      .catch(() => setData({ cases: [], hearings: [], courtrooms: [] }));
  useEffect(() => {
    refresh();
  }, []);
  let view;
  if (screen === "public")
    view = (
      <Public
        go={go}
        dashboard={localStorage.getItem("nyaya_token") ? role : ""}
        onCaseSearch={(cnr) => {
          setCnrQuery(cnr);
          go("case-search");
        }}
      />
    );
  else if (screen === "case-search")
    view = <CaseLookup initialQuery={cnrQuery} back={() => go("public")} />;
  else if (screen === "role") view = <Role go={go} />;
  else if (screen.startsWith("signup"))
    view = (
      <Signup
        role={screen.includes("authority") ? "Authority" : "Advocate"}
        go={go}
      />
    );
  else if (screen.startsWith("login"))
    view = (
      <Login
        role={screen.includes("authority") ? "Authority" : "Advocate"}
        go={go}
      />
    );
  else view = <Workspace role={role} exit={() => go("public")} />;
  return (
    <DataContext.Provider value={{ ...data, refresh }}>
      {view}
    </DataContext.Provider>
  );
}
export function Workspace({ role, exit }) {
  const authority = role === "authority";
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_user")) || {};
    } catch {
      return {};
    }
  })();
  const savedName =
    currentUser.name || (authority ? "Rajiv Arora" : "Arjun Rao");
  const displayName =
    !authority && !savedName.startsWith("Adv.")
      ? `Adv. ${savedName}`
      : savedName;
  const initials = displayName
    .replace("Adv. ", "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileImage = localStorage.getItem(`nyaya_profile_image_${currentUser.id}`) || "";
  const nav = authority ? authorityNav : advocateNav;
  const [page, setPage] = useState("Dashboard");
  const [mobile, setMobile] = useState(false);
  const [unread, setUnread] = useState(3);
  const [profileMenu, setProfileMenu] = useState(false);
  const logout = async () => {
    if (!window.confirm("Do you want to log out?")) return;
    const token = localStorage.getItem("nyaya_token");
    if (token)
      await fetch("/api/auth/logout/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    localStorage.removeItem("nyaya_token");
    localStorage.removeItem("nyaya_user");
    exit();
  };
  return (
    <div className="app-shell">
      <aside className={mobile ? "open" : ""}>
        <div className="side-brand brand">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="Scale" size={17} />
          </span>
          Nyaya<span>Desk</span>
        </div>
        <p className="workspace-label">
          {authority ? "AUTHORITY WORKSPACE" : "ADVOCATE WORKSPACE"}
        </p>
        {nav.map(([i, n]) => (
          <button
            key={n}
            className={page === n ? "nav-active" : ""}
            onClick={() => {
              setPage(n);
              setMobile(false);
            }}
          >
            <Icon name={i} />
            {n}
            {n === "Notifications" && unread > 0 && (
              <b className="unread">{unread}</b>
            )}
          </button>
        ))}
        <div className="side-bottom">
          <button
            onClick={() => {
              setPage("Profile");
              setMobile(false);
            }}
          >
            <Icon name="CircleUserRound" /> Profile
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header>
          <button className="hamburger" onClick={() => setMobile(!mobile)}>
            <Icon name="Menu" />
          </button>
          <div className="top-search">
            <Icon name="Search" />
            <input placeholder="Search cases, documents..." />
          </div>
          <div className="top-actions">
            <button
              className="header-home"
              onClick={exit}
              title="Home"
              aria-label="Home"
            >
              <Icon name="House" />
            </button>
            <button
              onClick={() => setPage("Notifications")}
              aria-label="Notifications"
              title="Notifications"
            >
              <Icon name="Bell" />
              {unread > 0 && <i />}
            </button>
            <div
              className="account-menu"
              onMouseEnter={() => setProfileMenu(true)}
              onMouseLeave={() => setProfileMenu(false)}
            >
              <button
                className="account-trigger"
                onClick={() => setProfileMenu(!profileMenu)}
              >
                <span className="avatar profile-photo">{profileImage ? <img src={profileImage} alt="Profile" /> : initials}</span>
                <span className="user-name">
                  <b>{displayName}</b>
                  <small>{authority ? "Court Authority" : "Advocate"}</small>
                </span>
                <Icon name="ChevronDown" size={15} />
              </button>
              {profileMenu && (
                <div className="account-dropdown">
                  <button
                    onClick={() => {
                      setPage("Profile");
                      setProfileMenu(false);
                    }}
                  >
                    <Icon name="CircleUserRound" size={16} /> Profile
                  </button>
                  <button onClick={logout}>
                    <Icon name="LogOut" size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="content">
          {authority ? (
            <Authority
              page={page}
              setPage={setPage}
              clear={() => setUnread(0)}
            />
          ) : (
            <Advocate
              page={page}
              setPage={setPage}
              clear={() => setUnread(0)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export function CourtOtherHelper() {
  useEffect(() => {
    const addOther = () => {
      document.querySelectorAll('select[name="court"]').forEach((select) => {
        if (select.dataset.otherReady) return;
        select.dataset.otherReady = "true";
        const option = document.createElement("option");
        option.value = "Other";
        option.textContent = "Other â€” enter court name";
        select.append(option);
        option.textContent = "Other - enter court name";
        const input = document.createElement("input");
        input.className = "other-court-input";
        input.placeholder = "Enter court name";
        input.style.display = "none";
        select.insertAdjacentElement("afterend", input);
        select.addEventListener(
          "change",
          () =>
            (input.style.display = select.value === "Other" ? "block" : "none"),
        );
        select.closest("form")?.addEventListener("submit", () => {
          if (select.value === "Other" && input.value.trim())
            option.value = input.value.trim();
        });
      });
    };
    addOther();
    const observer = new MutationObserver(addOther);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function ScheduleCaseNavigator() {
  useEffect(() => {
    const open = () => {
      const title = sessionStorage.getItem("nyaya_selected_case");
      [...document.querySelectorAll("aside button")]
        .find((button) => button.textContent.includes("My Cases"))
        ?.click();
      setTimeout(
        () =>
          [...document.querySelectorAll(".cases-table .tr")]
            .find((row) => row.textContent.includes(title))
            ?.querySelector(".btn")
            ?.click(),
        0,
      );
    };
    window.addEventListener("nyaya-open-case", open);
    return () => window.removeEventListener("nyaya-open-case", open);
  }, []);
  return null;
}
export function ProfileCourtHelper() {
  useEffect(() => {
    const setup = () =>
      document.querySelectorAll(".profile-form select").forEach((select) => {
        if (select.dataset.customCourt) return;
        select.dataset.customCourt = "true";
        const option = document.createElement("option");
        option.value = "Other";
        option.textContent = "Other â€” enter court name";
        select.append(option);
        option.textContent = "Other - enter court name";
        const input = document.createElement("input");
        input.className = "other-court-input";
        input.placeholder = "Enter court name";
        input.style.display = "none";
        select.insertAdjacentElement("afterend", input);
        select.addEventListener(
          "change",
          () =>
            (input.style.display = select.value === "Other" ? "block" : "none"),
        );
        select.closest("form")?.addEventListener("submit", () => {
          if (select.value === "Other" && input.value.trim()) {
            option.value = input.value.trim();
            select.value = input.value.trim();
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    setup();
    const observer = new MutationObserver(setup);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function SidebarProfileName() {
  useEffect(() => {
    const update = () => {
      const user = JSON.parse(localStorage.getItem("nyaya_user") || "{}");
      const name = user.name
        ? `Adv. ${user.name.replace(/^Adv\.\s*/, "")}`
        : "Profile";
      document.querySelectorAll(".side-bottom button").forEach((button) => {
        const text = [...button.childNodes].find(
          (node) => node.nodeType === Node.TEXT_NODE,
        );
        if (text) text.nodeValue = ` ${name}`;
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function DemoAuthHelper() {
  useEffect(() => {
    const addButtons = () =>
      document.querySelectorAll(".login-card").forEach((card) => {
        if (card.dataset.demoReady) return;
        card.dataset.demoReady = "true";
        const role = card.textContent.includes("AUTHORITY")
          ? "Authority"
          : "Advocate";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "demo";
        button.textContent = `Continue with Demo ${role}`;
        button.onclick = () => {
          localStorage.setItem("nyaya_token", "demo-session");
          localStorage.setItem(
            "nyaya_user",
            JSON.stringify({
              id: role === "Authority" ? "DEMO-AUTH-001" : "DEMO-ADV-001",
              name:
                role === "Authority" ? "Demo Court Authority" : "Demo Advocate",
              role,
            }),
          );
          window.location.hash = "demo";
          window.location.reload();
        };
        card.append(button);
      });
    addButtons();
    if (window.location.hash === "#demo")
      setTimeout(() => {
        document.querySelector(".profile-nav")?.click();
        history.replaceState(null, "", window.location.pathname);
      }, 0);
    const observer = new MutationObserver(addButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function ProfileLogoutHelper() {
  useEffect(() => {
    const setup = () =>
      document.querySelectorAll(".profile-top").forEach((top) => {
        if (top.dataset.logoutReady) return;
        top.dataset.logoutReady = "true";
        const button = document.createElement("button");
        button.className = "profile-logout";
        button.textContent = "Sign Out";
        button.onclick = () => {
          if (!window.confirm("Do you want to log out?")) return;
          localStorage.removeItem("nyaya_token");
          localStorage.removeItem("nyaya_user");
          window.location.reload();
        };
        top.append(button);
      });
    setup();
    const observer = new MutationObserver(setup);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function FrontendDummyData() {
  useEffect(() => {
    const data = {
      cases: [
        {
          id: "ABC/2026",
          title: "ABC vs XYZ",
          type: "Civil Appeal",
          court: "High Court of Delhi",
          judge: "Justice A. Mehra",
          next: "03 Sep, 09:30 AM",
          status: "Active",
        },
        {
          id: "DEF/2026",
          title: "DEF vs GHI",
          type: "Commercial",
          court: "High Court of Delhi",
          judge: "Justice B. Rao",
          next: "03 Sep, 11:00 AM",
          status: "Pending",
        },
        {
          id: "JKL/2026",
          title: "JKL vs MNO",
          type: "Writ Petition",
          court: "High Court of Delhi",
          judge: "Justice C. Shah",
          next: "03 Sep, 02:00 PM",
          status: "Active",
        },
        {
          id: "PQR/2026",
          title: "PQR vs State",
          type: "Criminal",
          court: "District Court",
          judge: "Justice D. Sen",
          next: "12 Sep, 10:30 AM",
          status: "Upcoming Hearing",
        },
        {
          id: "RST/2026",
          title: "Rao Industries vs Union of India",
          type: "Commercial Appeal",
          court: "High Court of Delhi",
          judge: "Justice B. Rao",
          next: "03 Sep, 03:30 PM",
          status: "Pending",
        },
      ],
      courtrooms: [
        {
          room: "Courtroom 1",
          judge: "Justice A. Mehra",
          status: "Present",
          current: "ABC/2026",
        },
        {
          room: "Courtroom 2",
          judge: "Justice B. Rao",
          status: "Present",
          current: "DEF/2026",
        },
        {
          room: "Courtroom 3",
          judge: "Justice C. Shah",
          status: "Absent",
          current: "GHI/2026",
        },
        {
          room: "Courtroom 4",
          judge: "Justice D. Sen",
          status: "Updated",
          current: "JKL/2026",
        },
        {
          room: "Courtroom 5",
          judge: "Justice E. Kapoor",
          status: "Present",
          current: "RST/2026",
        },
      ],
      hearings: [
        {
          id: "H-001",
          date: "2026-09-03",
          time: "09:30 AM",
          case: "ABC vs XYZ",
          room: "Courtroom 3",
          judge: "Justice A. Mehra",
          status: "Scheduled",
        },
        {
          id: "H-002",
          date: "2026-09-03",
          time: "11:00 AM",
          case: "DEF vs GHI",
          room: "Courtroom 5",
          judge: "Justice B. Rao",
          status: "Scheduled",
        },
        {
          id: "H-003",
          date: "2026-09-03",
          time: "02:00 PM",
          case: "JKL vs MNO",
          room: "Courtroom 2",
          judge: "Justice C. Shah",
          status: "Scheduled",
        },
        {
          id: "H-005",
          date: "2026-09-03",
          time: "03:30 PM",
          case: "Rao Industries vs Union of India",
          room: "Courtroom 5",
          judge: "Justice E. Kapoor",
          status: "Scheduled",
        },
        {
          id: "H-004",
          date: "2026-09-12",
          time: "10:30 AM",
          case: "PQR vs State",
          room: "Courtroom 1",
          judge: "Justice D. Sen",
          status: "Scheduled",
        },
      ],
    };
    const original = window.fetch.bind(window);
    window.fetch = (url, options) => {
      const path = String(url);
      if (
        path.includes("/api/assignments/") &&
        options?.method === "POST"
      ) {
        const assignment = JSON.parse(options.body || "{}");
        const room = data.courtrooms.find(
          (item) => item.room === assignment.courtroom,
        );
        if (room)
          Object.assign(room, {
            judge: assignment.judge || room.judge,
            status: "Updated",
          });
        return Promise.resolve(
          new Response(JSON.stringify({ ...assignment, status: "Assigned" }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      const match = Object.keys(data).find((key) =>
        path.includes(`/api/${key}/`),
      );
      return match
        ? Promise.resolve(
            new Response(JSON.stringify(data[match]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          )
        : original(url, options);
    };
    return () => {
      window.fetch = original;
    };
  }, []);
  return null;
}
