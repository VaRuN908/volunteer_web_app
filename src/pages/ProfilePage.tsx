import { useState } from "react";
import {
  EditIcon,
  HelpIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon
} from "../components/icons";
import { appContent } from "../data/appContent";

const supportIconMap = {
  Settings: SettingsIcon,
  Privacy: ShieldIcon,
  "Help & Support": HelpIcon
};

export function ProfilePage() {
  const profile = appContent.profile;
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [activeSupportLink, setActiveSupportLink] = useState(profile.supportLinks[0] ?? "");
  const [editableProfile, setEditableProfile] = useState({
    name: profile.name,
    role: profile.role,
    about: profile.about
  });
  const [profileNotice, setProfileNotice] = useState("Your profile overview is ready.");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredDetails = profile.details.filter((detail) =>
    [detail.label, detail.value].join(" ").toLowerCase().includes(normalizedSearch)
  );
  const filteredSkills = profile.skills.filter((skill) =>
    skill.toLowerCase().includes(normalizedSearch)
  );
  const filteredCollaborations = profile.collaborations.filter((item) =>
    [item.title, item.subtitle, item.meta, item.status].join(" ").toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="profile-simple">
      <header className="profile-simple-topbar">
        <div>
          <span className="section-kicker">Volunteer Identity</span>
          <h3>Profile</h3>
          <p>A simple, professional profile for your volunteer work and leadership.</p>
        </div>

        <div className="profile-simple-tools">
          <label className="profile-studio-search" aria-label="Search profile content">
            <SearchIcon className="small-icon muted-icon" />
            <input
              type="search"
              placeholder="Search profile details"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button
            className="profile-simple-edit"
            type="button"
            onClick={() => {
              setEditMode((current) => !current);
              setProfileNotice(editMode ? "Edit mode closed." : "Edit mode opened for your profile.");
            }}
          >
            <EditIcon className="small-icon" />
            <span>{editMode ? "Close Edit" : "Edit Profile"}</span>
          </button>
        </div>
      </header>

      <div className="page-feedback-banner">{profileNotice}</div>

      <section className="profile-simple-hero">
        <div className="profile-simple-identity-card">
          <div className="profile-simple-avatar-wrap">
            <div className="profile-studio-avatar-ring profile-studio-avatar-ring-simple">
              <div className="profile-studio-avatar">RS</div>
            </div>
          </div>

          <div className="profile-simple-identity-copy">
            {editMode ? (
              <div className="profile-edit-fields">
                <input
                  className="profile-inline-input"
                  value={editableProfile.name}
                  onChange={(event) =>
                    setEditableProfile((current) => ({ ...current, name: event.target.value }))
                  }
                />
                <input
                  className="profile-inline-input"
                  value={editableProfile.role}
                  onChange={(event) =>
                    setEditableProfile((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </div>
            ) : (
              <>
                <h2>{editableProfile.name}</h2>
                <p>{editableProfile.role}</p>
              </>
            )}

            {editMode ? (
              <textarea
                className="profile-inline-textarea"
                value={editableProfile.about}
                onChange={(event) =>
                  setEditableProfile((current) => ({ ...current, about: event.target.value }))
                }
              />
            ) : (
              <p className="profile-studio-bio">{editableProfile.about}</p>
            )}
          </div>
        </div>

        <div className="profile-simple-metrics-card">
          <span className="section-kicker">Overview</span>
          <div className="profile-simple-metric-grid">
            {profile.metrics.map((metric) => (
              <article key={metric.label} className="profile-simple-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="profile-simple-highlight">
            <strong>Current focus</strong>
            <p>
              Building dependable volunteer systems, smoother event coordination, and stronger
              community follow-through.
            </p>
          </div>
        </div>
      </section>

      <div className="profile-simple-grid">
        <section className="profile-simple-card">
          <div className="profile-simple-card-head">
            <h4>Professional Summary</h4>
          </div>
          <p className="profile-simple-copy">{editableProfile.about}</p>
        </section>

        <section className="profile-simple-card">
          <div className="profile-simple-card-head">
            <h4>Key Details</h4>
          </div>
          <div className="profile-simple-detail-list">
            {filteredDetails.map((detail) => (
              <div key={detail.label} className="profile-simple-detail-item">
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="profile-simple-grid">
        <section className="profile-simple-card">
          <div className="profile-simple-card-head">
            <h4>Core Skills</h4>
          </div>
          <div className="profile-tag-row">
            {filteredSkills.map((skill) => (
              <button
                key={skill}
                className="profile-tag"
                type="button"
                onClick={() => setProfileNotice(`Skill focus selected: ${skill}.`)}
              >
                {skill}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-simple-card">
          <div className="profile-simple-card-head">
            <h4>Current and Recent Work</h4>
          </div>
          <div className="profile-simple-collaboration-list">
            {filteredCollaborations.map((item) => (
              <article key={item.id} className="profile-simple-collaboration">
                <span
                  className="profile-simple-collaboration-dot"
                  style={{ background: item.accent }}
                />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                </div>
                <div className="profile-simple-collaboration-meta">
                  <span>{item.meta}</span>
                  <strong>{item.status}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="profile-simple-card">
        <div className="profile-simple-card-head">
          <h4>Quick Actions</h4>
        </div>
        <div className="profile-simple-actions">
          {profile.supportLinks.map((link) => {
            const Icon = supportIconMap[link as keyof typeof supportIconMap] ?? HelpIcon;

            return (
              <button
                key={link}
                className={
                  activeSupportLink === link
                    ? "profile-simple-action is-active"
                    : "profile-simple-action"
                }
                type="button"
                onClick={() => {
                  setActiveSupportLink(link);
                  setProfileNotice(`${link} panel selected.`);
                }}
              >
                <span className="profile-simple-action-icon">
                  <Icon className="small-icon" />
                </span>
                <span>{link}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
