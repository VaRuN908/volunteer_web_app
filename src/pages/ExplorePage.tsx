import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, LockIcon } from "../components/icons";
import { appContent } from "../data/appContent";

export function ExplorePage() {
  const navigate = useNavigate();
  const {
    categories,
    featuredEvents,
    heading,
    searchPlaceholder,
    spotlight,
    subheading,
    suggested,
    trending
  } = appContent.explore;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "");
  const [selectedAction, setSelectedAction] = useState("Ready to match volunteers with the right opportunity.");
  const [connectedCards, setConnectedCards] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredCards = useMemo(() => {
    return suggested.filter((card) => {
      const matchesCategory =
        activeCategory.length === 0 || card.categoryIds.includes(activeCategory);
      const haystack = [
        card.name,
        card.role,
        card.tagline,
        card.focusAreas.join(" "),
        card.impact
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, normalizedQuery, suggested]);

  const activeCategoryLabel =
    categories.find((category) => category.id === activeCategory)?.label ?? "All projects";

  function handlePrimaryAction(actionLabel: string, eventTitle?: string) {
    if (eventTitle) {
      setSelectedAction(`${actionLabel} opened for ${eventTitle}.`);
    } else {
      setSelectedAction(`${actionLabel} requested.`);
    }
    if (actionLabel === "Volunteer Now") {
      navigate("/app/chat");
    }
  }

  function handleConnect(cardId: string, cardName: string) {
    setConnectedCards((current) =>
      current.includes(cardId)
        ? current.filter((item) => item !== cardId)
        : [...current, cardId]
    );
    setSelectedAction(`Updated connection status for ${cardName}.`);
  }

  return (
    <div className="home-dashboard">
      <header className="home-topbar">
        <div className="home-brand">
          <img src="/logo.png" alt="Volunteer Connect logo" className="home-brand-image" />
          <div className="home-brand-copy">
            <strong>{appContent.shell.title}</strong>
            <span>{appContent.shell.tagline}</span>
          </div>
        </div>

        <div className="home-heading-pill">
          <h3>{heading}</h3>
        </div>

        <label className="home-search" aria-label="Search volunteer opportunities">
          <SearchIcon className="small-icon muted-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>

        <button
          className="home-avatar-button"
          type="button"
          aria-label="Open profile"
          onClick={() => navigate("/app/profile")}
        >
          RS
        </button>
      </header>

      <div className="page-feedback-banner">{selectedAction}</div>

      <section className="home-filter-row" aria-label="Volunteer categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={
              activeCategory === category.id ? "home-filter is-active" : "home-filter"
            }
            type="button"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </section>

      <div className="home-content-grid">
        <section className="home-main-column">
          <section className="home-suggested-section">
            <div className="section-heading home-section-heading">
              <div>
                <span className="section-kicker">Recommended Teams</span>
                <h4>Matches for {activeCategoryLabel}</h4>
              </div>
              <span className="section-link">
                {filteredCards.length} match{filteredCards.length === 1 ? "" : "es"}
              </span>
            </div>

            <div className="home-suggested-grid">
              {filteredCards.map((card) => (
                <article key={card.id} className="home-volunteer-card">
                  <div className="home-card-topline">
                    <div className="card-avatar small" style={{ background: card.accent }}>
                      <span>{card.initials}</span>
                    </div>
                    <div className="card-copy">
                      <strong>{card.name}</strong>
                      <span>{card.role}</span>
                    </div>
                  </div>

                  <p>{card.tagline}</p>

                  <div className="home-card-meta">
                    <span>{card.impact}</span>
                    <span>{card.availability}</span>
                  </div>

                  <div className="pill-list">
                    {card.focusAreas.map((focusArea) => (
                      <span key={focusArea} className="soft-pill soft-pill-light">
                        {focusArea}
                      </span>
                    ))}
                  </div>

                  <button
                    className={
                      connectedCards.includes(card.id)
                        ? "home-inline-button is-active"
                        : "home-inline-button"
                    }
                    type="button"
                    onClick={() => handleConnect(card.id, card.name)}
                  >
                    {connectedCards.includes(card.id) ? "Connected" : card.actionLabel}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="home-section-headline">
            <div>
              <span className="section-kicker">Volunteer Opportunities</span>
              <h4>Upcoming Events Requiring Volunteers</h4>
              <p>{subheading}</p>
            </div>
            <button
              className="home-pill-button"
              type="button"
              onClick={() => handlePrimaryAction("Find Your Fit Now")}
            >
              Find Your Fit Now
            </button>
          </div>

          <div className="home-events-list">
            {featuredEvents.map((event) => {
              const initials = event.title
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <article key={event.title} className="home-feature-card">
                  <div className="home-feature-art">
                    <div className="home-feature-badge">
                      <span>{event.category}</span>
                      <strong>{initials}</strong>
                    </div>
                  </div>

                  <div className="home-feature-copy">
                    <div className="home-feature-header">
                      <div>
                        <h5>{event.title}</h5>
                        <span>{event.category}</span>
                      </div>
                      <div className="home-feature-meta">
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="home-role-strip">
                      {event.roleStats.map((roleStat) => (
                        <div key={roleStat.label} className="home-role-chip">
                          <strong>{roleStat.label}</strong>
                          <span>{roleStat.count}</span>
                        </div>
                      ))}
                    </div>

                    <p>{event.description}</p>

                    <div className="home-action-row">
                      {event.actions.map((actionLabel, index) => (
                        <button
                          key={actionLabel}
                          className={index === 0 ? "home-primary-action" : "home-secondary-action"}
                          type="button"
                          onClick={() => handlePrimaryAction(actionLabel, event.title)}
                        >
                          {actionLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </section>

        <aside className="home-side-column">
          <section className="home-side-panel">
            <div className="section-heading home-section-heading">
              <div>
                <span className="section-kicker">Trending Causes</span>
                <h4>What volunteers are joining now</h4>
              </div>
            </div>

            <div className="home-trending-list">
              {trending.map((topic) => (
                <article key={topic.id} className="home-trend-card">
                  <strong>{topic.label}</strong>
                  <span>{topic.momentum}</span>
                  <p>{topic.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-side-panel home-spotlight-panel">
            <div>
              <span className="section-kicker">Quick Response</span>
              <h4>{spotlight.title}</h4>
              <p>{spotlight.description}</p>
            </div>

            <button
              className="home-pill-button home-pill-button-full"
              type="button"
              onClick={() => {
                setSelectedAction(`${spotlight.title} shared with your inbox.`);
                navigate("/app/chat");
              }}
            >
              {spotlight.cta}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
