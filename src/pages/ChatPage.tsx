import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, SmileIcon } from "../components/icons";
import { appContent } from "../data/appContent";
import { getChatContent, getSocketUrl, sendMessage } from "../lib/api";
import { getSession } from "../lib/session";

type SocketMessagePayload = {
  type: "chat:message";
  conversationId: string;
  senderUserId: string;
  snippet: string;
  updatedLabel: string;
  message: {
    id: string;
    body: string;
    time: string;
  };
};

export function ChatPage() {
  const [chatData, setChatData] = useState<typeof appContent.chat>(appContent.chat);
  const { conversations } = chatData;
  const [selectedId, setSelectedId] = useState(conversations[1]?.id ?? conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [chatNotice, setChatNotice] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const session = getSession();
  
  useEffect(() => {
    async function loadChat() {
      try {
        const data = await getChatContent();
        setChatData(data);
        setSelectedId(data.conversations[1]?.id ?? data.conversations[0]?.id ?? "");
      } catch (error) {
        setChatNotice(
          error instanceof Error ? error.message : "Using local chat data because the API is unavailable."
        );
      }
    }

    void loadChat();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(getSocketUrl());
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setChatNotice("Realtime chat connected.");
    });

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as { type?: string };

      if (payload.type !== "chat:message") {
        return;
      }

      const messagePayload = payload as SocketMessagePayload;

      setChatData((current) => {
        const target = current.conversations.find(
          (conversation) => conversation.id === messagePayload.conversationId
        );

        if (!target) {
          return current;
        }

        const updatedConversation = {
          ...target,
          snippet: messagePayload.snippet,
          time: messagePayload.updatedLabel,
          messages: [
            ...target.messages,
            {
              id: messagePayload.message.id,
              author: (messagePayload.senderUserId === session?.userId ? "self" : "other") as
                | "self"
                | "other",
              body: messagePayload.message.body,
              time: messagePayload.message.time
            }
          ]
        };

        return {
          ...current,
          conversations: [
            updatedConversation,
            ...current.conversations.filter(
              (conversation) => conversation.id !== messagePayload.conversationId
            )
          ]
        };
      });
    });

    socket.addEventListener("close", () => {
      setChatNotice("Realtime chat disconnected. Refresh to reconnect.");
    });

    return () => {
      socket.close();
    };
  }, [session?.userId]);

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

  const selectedMessages = selectedConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedConversation || draft.trim().length === 0) {
      return;
    }

    try {
      setIsSending(true);
      const nextBody = draft.trim();

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "chat:message",
            conversationId: selectedConversation.id,
            body: nextBody
          })
        );
      } else {
        const updatedConversation = await sendMessage(selectedConversation.id, nextBody);
        setChatData((current) => ({
          ...current,
          conversations: [
            updatedConversation,
            ...current.conversations.filter(
              (conversation) => conversation.id !== updatedConversation.id
            )
          ]
        }));
      }

      setDraft("");
      setChatNotice(`Message sent to ${selectedConversation.name}.`);
    } catch (error) {
      setChatNotice(error instanceof Error ? error.message : "Could not send your message.");
    } finally {
      setIsSending(false);
    }
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
                    <strong>{conversation.name}</strong>
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
          {chatNotice ? <div className="page-feedback-banner chat-feedback-banner">{chatNotice}</div> : null}
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
              className="chat-console-send-button"
              type="submit"
              disabled={isSending || draft.trim().length === 0}
            >
              {isSending ? "Sending..." : "Send"}
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
