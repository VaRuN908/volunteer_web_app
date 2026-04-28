import { FormEvent, useEffect, useState } from "react";
import type { AdminDashboard } from "../data/models";
import { createCommunity, createTask, getAdminDashboard, submitSurvey } from "../lib/api";

const emptyDashboard: AdminDashboard = {
  stats: { communities: 0, tasks: 0, surveys: 0, matches: 0 },
  communities: [],
  tasks: [],
  surveys: [],
  matches: []
};

export function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [notice, setNotice] = useState("Manage communities, capture needs, and monitor live matches.");
  const [isLoading, setIsLoading] = useState(true);
  const [communityForm, setCommunityForm] = useState({
    name: "",
    location: "",
    description: "",
    focusRole: ""
  });
  const [taskForm, setTaskForm] = useState({
    communityId: "",
    title: "",
    needCategory: "community",
    urgencyScore: "7",
    description: "",
    location: "",
    eventDate: "",
    timeRange: "",
    skillsRequired: "Team Coordination, Community Outreach"
  });
  const [surveyForm, setSurveyForm] = useState({
    communityId: "",
    rawText: ""
  });

  async function refreshDashboard() {
    try {
      setIsLoading(true);
      const data = await getAdminDashboard();
      setDashboard(data);
      setTaskForm((current) => ({
        ...current,
        communityId: current.communityId || data.communities[0]?.id || ""
      }));
      setSurveyForm((current) => ({
        ...current,
        communityId: current.communityId || data.communities[0]?.id || ""
      }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load the admin dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
  }, []);

  async function handleCreateCommunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createCommunity(communityForm);
      setCommunityForm({ name: "", location: "", description: "", focusRole: "" });
      setNotice("Community created successfully.");
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create this community.");
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createTask({
        ...taskForm,
        urgencyScore: Number(taskForm.urgencyScore),
        skillsRequired: taskForm.skillsRequired
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      });
      setTaskForm((current) => ({
        ...current,
        title: "",
        description: "",
        location: "",
        eventDate: "",
        timeRange: "",
        skillsRequired: "Team Coordination, Community Outreach"
      }));
      setNotice("Task created and matching scores refreshed.");
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create this task.");
    }
  }

  async function handleSubmitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await submitSurvey(surveyForm);
      setSurveyForm((current) => ({ ...current, rawText: "" }));
      setNotice(response.parsed?.summary ?? "Survey analyzed successfully.");
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not analyze this survey.");
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <span className="section-kicker">Admin Console</span>
          <h3>Community Operations</h3>
          <p>Control the full prototype flow: communities, tasks, survey NLP, and match scoring.</p>
        </div>
      </header>

      <div className="page-feedback-banner">{notice}</div>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>Communities</span>
          <strong>{dashboard.stats.communities}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Tasks</span>
          <strong>{dashboard.stats.tasks}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Survey Inputs</span>
          <strong>{dashboard.stats.surveys}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Matches</span>
          <strong>{dashboard.stats.matches}</strong>
        </article>
      </section>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Create Community</h4>
          </div>

          <form className="admin-form" onSubmit={handleCreateCommunity}>
            <input
              placeholder="Community name"
              value={communityForm.name}
              onChange={(event) => setCommunityForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              placeholder="Location"
              value={communityForm.location}
              onChange={(event) => setCommunityForm((current) => ({ ...current, location: event.target.value }))}
            />
            <input
              placeholder="Focus role"
              value={communityForm.focusRole}
              onChange={(event) => setCommunityForm((current) => ({ ...current, focusRole: event.target.value }))}
            />
            <textarea
              placeholder="Describe this community"
              value={communityForm.description}
              onChange={(event) => setCommunityForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button className="home-pill-button admin-submit" type="submit">
              Add Community
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Active Communities</h4>
          </div>

          <div className="admin-list">
            {(isLoading ? [] : dashboard.communities).map((community) => (
              <article key={community.id} className="admin-list-item">
                <div>
                  <strong>{community.name}</strong>
                  <p>{community.location}</p>
                </div>
                <span>{community.focusRole}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Create Task</h4>
          </div>

          <form className="admin-form" onSubmit={handleCreateTask}>
            <select
              value={taskForm.communityId}
              onChange={(event) => setTaskForm((current) => ({ ...current, communityId: event.target.value }))}
            >
              {dashboard.communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              placeholder="Need category"
              value={taskForm.needCategory}
              onChange={(event) => setTaskForm((current) => ({ ...current, needCategory: event.target.value }))}
            />
            <input
              placeholder="Urgency score"
              type="number"
              min="1"
              max="10"
              value={taskForm.urgencyScore}
              onChange={(event) => setTaskForm((current) => ({ ...current, urgencyScore: event.target.value }))}
            />
            <input
              placeholder="Location"
              value={taskForm.location}
              onChange={(event) => setTaskForm((current) => ({ ...current, location: event.target.value }))}
            />
            <input
              placeholder="Event date"
              value={taskForm.eventDate}
              onChange={(event) => setTaskForm((current) => ({ ...current, eventDate: event.target.value }))}
            />
            <input
              placeholder="Time range"
              value={taskForm.timeRange}
              onChange={(event) => setTaskForm((current) => ({ ...current, timeRange: event.target.value }))}
            />
            <input
              placeholder="Skills required"
              value={taskForm.skillsRequired}
              onChange={(event) => setTaskForm((current) => ({ ...current, skillsRequired: event.target.value }))}
            />
            <textarea
              placeholder="Task description"
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button className="home-pill-button admin-submit" type="submit">
              Add Task
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Matching Scoreboard</h4>
          </div>

          <div className="admin-list">
            {dashboard.matches.slice(0, 6).map((match) => (
              <article key={match.id} className="admin-list-item admin-match-item">
                <div>
                  <strong>{match.taskTitle}</strong>
                  <p>{match.volunteerName} • {match.communityName}</p>
                  <p>{match.reasons.join(" • ")}</p>
                </div>
                <span>{match.matchScore}%</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Survey Intake + NLP</h4>
          </div>

          <form className="admin-form" onSubmit={handleSubmitSurvey}>
            <select
              value={surveyForm.communityId}
              onChange={(event) => setSurveyForm((current) => ({ ...current, communityId: event.target.value }))}
            >
              {dashboard.communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Paste a community need description here"
              value={surveyForm.rawText}
              onChange={(event) => setSurveyForm((current) => ({ ...current, rawText: event.target.value }))}
            />
            <button className="home-pill-button admin-submit" type="submit">
              Analyze Need
            </button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h4>Recent Survey Insights</h4>
          </div>

          <div className="admin-list">
            {dashboard.surveys.slice(0, 5).map((survey) => (
              <article key={survey.id} className="admin-list-item">
                <div>
                  <strong>{survey.communityName}</strong>
                  <p>{survey.parsedNeeds.summary}</p>
                </div>
                <span>{survey.createdAt.slice(0, 10)}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
