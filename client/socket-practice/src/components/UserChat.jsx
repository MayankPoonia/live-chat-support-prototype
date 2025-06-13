import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const UserChat = () => {
  const [ticketId, setTicketId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("ticket-created", (data) => {
      setTicketId(data.ticketId);
      setMessages((prev) => [
        ...prev,
        {
          text: "Support ticket created. Please wait for an admin to respond.",
          sender: "system",
        },
      ]);
    });

    socket.on("admin-response", (data) => {
      setMessages((prev) => {
        const hasAdminMessage = prev.some((msg) => msg.sender === "admin");
        if (!hasAdminMessage) {
          return [
            ...prev.filter((msg) => msg.sender !== "system"),
            { text: "Admin has joined the conversation", sender: "system" },
            { text: data.message, sender: "admin" },
          ];
        }
        return [...prev, { text: data.message, sender: "admin" }];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("ticket-created");
      socket.off("admin-response");
    };
  }, []);

  const createTicket = () => {
    if (message.trim()) {
      const newMessage = { text: message, sender: "user" };
      setMessages([newMessage]);
      socket.emit("create-ticket", { message });
      setMessage("");
    }
  };

  const sendMessage = () => {
    if (message.trim() && ticketId) {
      const newMessage = { text: message, sender: "user" };
      setMessages((prev) => [...prev, newMessage]);
      socket.emit("user-message", { ticketId, message });
      setMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Support Chat</h2>
        <div style={styles.status}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.sender === "user"
                ? styles.userMessage
                : msg.sender === "admin"
                ? styles.adminMessage
                : styles.systemMessage),
            }}
          >
            <div style={styles.messageHeader}>
              <strong>{msg.sender === "user" ? "You" : msg.sender}</strong>
            </div>
            <div style={styles.messageText}>{msg.text}</div>
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            !ticketId ? "Describe your issue..." : "Type your message..."
          }
          style={styles.input}
          onKeyPress={(e) =>
            e.key === "Enter" && (!ticketId ? createTicket() : sendMessage())
          }
        />
        <button
          onClick={!ticketId ? createTicket : sendMessage}
          style={styles.button}
        >
          {!ticketId ? "Create Ticket" : "Send"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "24px",
  },
  status: {
    fontSize: "14px",
    color: "#666",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  message: {
    marginBottom: "15px",
    padding: "12px",
    borderRadius: "8px",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  userMessage: {
    backgroundColor: "#007bff",
    color: "white",
    marginLeft: "auto",
  },
  adminMessage: {
    backgroundColor: "#e9ecef",
    color: "#333",
    marginRight: "auto",
  },
  systemMessage: {
    backgroundColor: "#ffd700",
    color: "#333",
    margin: "10px auto",
    textAlign: "center",
    maxWidth: "90%",
  },
  messageHeader: {
    marginBottom: "5px",
    fontSize: "12px",
    opacity: 0.8,
  },
  messageText: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    padding: "10px 0",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#007bff",
    },
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#0056b3",
    },
  },
};

export default UserChat;
