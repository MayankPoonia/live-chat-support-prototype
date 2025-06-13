import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("admin-connect");
    });

    socket.on("active-tickets", (data) => {
      setTickets(data.tickets);
      if (selectedTicket) {
        const updatedTicket = data.tickets.find(
          (t) => t.id === selectedTicket.id
        );
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    });

    socket.on("new-ticket", (data) => {
      setTickets((prev) => [...prev, data.ticket]);
    });

    socket.on("user-message", (data) => {
      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id === data.ticketId) {
            const updatedTicket = {
              ...ticket,
              messages: [
                ...ticket.messages,
                { text: data.message, sender: "user" },
              ],
            };
            if (selectedTicket?.id === data.ticketId) {
              setSelectedTicket(updatedTicket);
            }
            return updatedTicket;
          }
          return ticket;
        })
      );
    });

    return () => {
      socket.off("connect");
      socket.off("active-tickets");
      socket.off("new-ticket");
      socket.off("user-message");
    };
  }, [selectedTicket]);

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
  };

  const sendResponse = () => {
    if (message.trim() && selectedTicket) {
      const newMessage = { text: message, sender: "admin" };

      const updatedTicket = {
        ...selectedTicket,
        messages: [...selectedTicket.messages, newMessage],
      };
      setSelectedTicket(updatedTicket);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id ? updatedTicket : ticket
        )
      );

      socket.emit("admin-response", {
        ticketId: selectedTicket.id,
        message: message,
      });

      setMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <div style={styles.status}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.ticketList}>
          <h3 style={styles.sectionTitle}>Active Tickets</h3>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                ...styles.ticketItem,
                ...(selectedTicket?.id === ticket.id && styles.selectedTicket),
              }}
              onClick={() => handleTicketSelect(ticket)}
            >
              <div style={styles.ticketHeader}>
                <span style={styles.ticketId}>Ticket #{ticket.id}</span>
                <span style={styles.ticketStatus}>
                  {ticket.messages.length > 0 ? "Active" : "New"}
                </span>
              </div>
              <div style={styles.ticketPreview}>
                {ticket.messages[0]?.text || "No messages yet"}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.chatSection}>
          {selectedTicket ? (
            <>
              <div style={styles.messagesContainer}>
                {selectedTicket.messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.message,
                      ...(msg.sender === "admin"
                        ? styles.adminMessage
                        : styles.userMessage),
                    }}
                  >
                    <div style={styles.messageHeader}>
                      <strong>{msg.sender === "admin" ? "You" : "User"}</strong>
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
                  placeholder="Type your response..."
                  style={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && sendResponse()}
                />
                <button onClick={sendResponse} style={styles.button}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noTicket}>Select a ticket to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
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
  content: {
    display: "flex",
    gap: "20px",
    flex: 1,
    overflow: "hidden",
  },
  ticketList: {
    width: "300px",
    borderRight: "1px solid #eee",
    paddingRight: "20px",
    overflowY: "auto",
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    color: "#333",
    fontSize: "18px",
  },
  ticketItem: {
    padding: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#fff",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  selectedTicket: {
    borderColor: "#007bff",
    backgroundColor: "#f0f7ff",
  },
  ticketHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  ticketId: {
    fontWeight: "bold",
    color: "#333",
  },
  ticketStatus: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#e9ecef",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  ticketPreview: {
    fontSize: "14px",
    color: "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chatSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  message: {
    marginBottom: "15px",
    padding: "12px",
    borderRadius: "8px",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  userMessage: {
    backgroundColor: "#e9ecef",
    color: "#333",
    marginRight: "auto",
  },
  adminMessage: {
    backgroundColor: "#007bff",
    color: "white",
    marginLeft: "auto",
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
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #eee",
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
  noTicket: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontSize: "16px",
  },
};

export default AdminDashboard;
