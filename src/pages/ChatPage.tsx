import { useEffect, useMemo, useRef, useState } from "react";
import {
  HeartIcon,
  ImageIcon,
  SmileIcon
} from "../components/icons";
import { appContent } from "../data/appContent";
import type { ChatMessage } from "../data/models";

type ChannelFilter = "all" | "private" | "group" | "community";

type Participant = {
  id: string;
  name: string;
  initials: string;
  accent: string;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function ChatPage() {
  const { conversations, featuredRequest } = appContent.chat;
  const [activeTab, setActiveTab] = useState<"PRIMARY" | "GENERAL">("PRIMARY");
  const [selectedId, setSelectedId] = useState(conversations[1]?.id ?? conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [chatNotice, setChatNotice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>(() =>
    Object.fromEntries(
      conversations.map((conversation) => [conversation.id, [...conversation.messages]])
    )
  );

  const filteredConversations = useMemo(() => {
    return conversations;
  }, [conversations]);

  useEffect(() => {
    if (
      filteredConversations.length > 0 &&
      !filteredConversations.some((conversation) => conversation.id === selectedId)
    ) {
      setSelectedId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedId]);

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedId) ??
    filteredConversations[0] ??
    null;

  const selectedMessages = selectedConversation
    ? messageStore[selectedConversation.id] ?? []
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  const participants: Participant[] = useMemo(() => {
    if (!selectedConversation) {
      return [];
    }

    return [
      {
        id: "participant-self",
        name: appContent.profile.name,
        initials: "RS",
        accent: "linear-gradient(135deg, #c084fc, #6366f1)"
      },
      {
        id: `participant-${selectedConversation.id}`,
        name: selectedConversation.name,
        initials: selectedConversation.initials,
        accent: selectedConversation.accent
      },
      {
        id: "participant-request",
        name: featuredRequest.name,
        initials: featuredRequest.initials,
        accent: featuredRequest.accent
      }
    ];
  }, [featuredRequest, selectedConversation]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedConversation || draft.trim().length === 0) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `${selectedConversation.id}-${Date.now()}`,
      author: "self",
      body: draft.trim(),
      time: formatTime(new Date())
    };

    setMessageStore((currentStore) => ({
      ...currentStore,
      [selectedConversation.id]: [...(currentStore[selectedConversation.id] ?? []), newMessage]
    }));
    setDraft("");
    setChatNotice(`Message sent to ${selectedConversation.name}.`);
  }

  return (
    <div className="chat-console">
      <aside className="chat-console-sidebar">
        <div className="chat-console-sidebar-header">
          <h2>Inbox</h2>
          <button
            className="chat-console-create-group"
            type="button"
            aria-label="Create a new group"
            onClick={() => setChatNotice("Create group clicked.")}
          >
            Create Group +
          </button>
        </div>

        <section className="chat-console-list">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              className={
                selectedConversation?.id === conversation.id
                  ? "chat-console-list-item is-active"
                  : "chat-console-list-item"
              }
              type="button"
              onClick={() => {
                setSelectedId(conversation.id);
                setChatNotice(`Opened ${conversation.name}.`);
              }}
            >
              <div
                className="chat-console-list-avatar"
                style={{ background: conversation.accent }}
              >
                <span>{conversation.initials}</span>
              </div>

              <div className="chat-console-list-copy">
                <strong>{conversation.name.toLowerCase().replace(/\s/g, '')}</strong>
                <p>{conversation.snippet} &bull; {conversation.time}</p>
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="empty-state">
              <p>No conversations match this search yet.</p>
            </div>
          )}
        </section>
      </aside>

      {selectedConversation ? (
        <section className="chat-console-stage">
          <div className="chat-console-thread">
            <div className="chat-console-date-divider">August 27, 2017 8:25 pm</div>
            {selectedMessages.map((message) => {
              const isSelf = message.author === "self";

              return (
                <article
                  key={message.id}
                  className={
                    isSelf
                      ? "chat-console-message is-self"
                      : "chat-console-message"
                  }
                >
                  <div className="chat-console-bubble">
                    <p>{message.body}</p>
                  </div>
                </article>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-console-composer" onSubmit={handleSubmit}>
            <button
              className="chat-console-tool-button"
              type="button"
              aria-label="Open emoji picker"
              onClick={() => {
                setDraft((current) => `${current}${current.length > 0 ? " " : ""}🙂`);
                setChatNotice("Emoji added to your draft.");
              }}
            >
              <SmileIcon className="small-icon" />
            </button>

            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message..."
            />

            <button
              className="chat-console-tool-button"
              type="button"
              aria-label="Attach an image"
            >
              <ImageIcon className="small-icon" />
            </button>

            <button
              className="chat-console-tool-button"
              type="button"
              aria-label="Send a heart"
            >
              <HeartIcon className="small-icon" />
            </button>
          </form>
        </section>
      ) : (
        <section className="chat-console-stage">
          <div className="empty-state">
            <p>Select a conversation to begin chatting.</p>
          </div>
        </section>
      )}
    </div>
  );
}
